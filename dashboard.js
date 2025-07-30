// Dashboard JavaScript

let habits = [];
let habitLogs = [];

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    loadUserData();
    loadHabits();
});

// Update current date display
function updateCurrentDate() {
    const today = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    const dateString = today.toLocaleDateString('en-US', options);
    document.getElementById('current-date').textContent = dateString;
}

// Load user data and habits
async function loadUserData() {
    try {
        const response = await fetch('get_user_data.php');
        const data = await response.json();

        if (data.success) {
            document.getElementById('user-greeting').textContent = `Welcome back, ${data.user.username}!`;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Load habits from server
async function loadHabits() {
    try {
        const response = await fetch('get_habits.php');
        const data = await response.json();

        if (data.success) {
            habits = data.habits;
            habitLogs = data.logs || [];
            displayHabits();
            updateStats();
        } else {
            console.error('Error loading habits:', data.message);
        }
    } catch (error) {
        console.error('Error loading habits:', error);
    }
}

// Display habits in the grid
function displayHabits() {
    const habitsContainer = document.getElementById('habits-container');
    const noHabitsMessage = document.getElementById('no-habits');

    if (!habits || habits.length === 0) {
        habitsContainer.style.display = 'none';
        noHabitsMessage.style.display = 'block';
        return;
    }

    habitsContainer.style.display = 'grid';
    noHabitsMessage.style.display = 'none';

    const today = new Date().toISOString().split('T')[0];

    habitsContainer.innerHTML = habits.map(habit => {
        const isCompleted = isHabitCompletedToday(habit.id, today);
        const shouldShowToday = shouldShowHabitToday(habit);

        if (!shouldShowToday) return '';

        return `
            <div class="habit-card ${isCompleted ? 'completed' : ''}" data-habit-id="${habit.id}">
                <div class="habit-header">
                    <h3 class="habit-title">${escapeHtml(habit.title)}</h3>
                    <div class="habit-actions">
                        <button class="btn btn-small ${isCompleted ? 'btn-secondary' : 'btn-success'}"
                                onclick="toggleHabitCompletion(${habit.id}, this)">
                            ${isCompleted ? 'Undo' : 'Done'}
                        </button>
                        <button class="btn btn-small btn-danger" onclick="deleteHabit(${habit.id})">
                            Delete
                        </button>
                    </div>
                </div>
                ${habit.description ? `<p class="habit-description">${escapeHtml(habit.description)}</p>` : ''}
                <div class="habit-meta">
                    <span class="habit-frequency">${capitalize(habit.frequency)}</span>
                    <span class="habit-category">${capitalize(habit.category || 'Other')}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Check if habit should be shown today
function shouldShowHabitToday(habit) {
    if (habit.frequency === 'daily') {
        return true;
    }

    if (habit.frequency === 'weekly') {
        const today = new Date();
        const dayName = today.toLocaleLowerCase().split(',')[0];
        const todayDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
        return habit.weekly_day === todayDay;
    }

    return true;
}

// Check if habit is completed today
function isHabitCompletedToday(habitId, date) {
    return habitLogs.some(log =>
        log.habit_id == habitId &&
        log.date_completed === date
    );
}

// Toggle habit completion
async function toggleHabitCompletion(habitId, buttonElement) {
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = isHabitCompletedToday(habitId, today);

    try {
        const response = await fetch('toggle_habit.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `habit_id=${habitId}&date=${today}&action=${isCompleted ? 'uncomplete' : 'complete'}`
        });

        const data = await response.json();

        if (data.success) {
            // Update local data
            if (isCompleted) {
                // Remove from logs
                habitLogs = habitLogs.filter(log =>
                    !(log.habit_id == habitId && log.date_completed === today)
                );
            } else {
                // Add to logs
                habitLogs.push({
                    habit_id: habitId,
                    date_completed: today
                });
            }

            // Update UI
            const habitCard = buttonElement.closest('.habit-card');
            if (isCompleted) {
                habitCard.classList.remove('completed');
                buttonElement.textContent = 'Done';
                buttonElement.className = 'btn btn-small btn-success';
            } else {
                habitCard.classList.add('completed');
                buttonElement.textContent = 'Undo';
                buttonElement.className = 'btn btn-small btn-secondary';
            }

            updateStats();

        } else {
            console.error('Error toggling habit:', data.message);
            alert('Error updating habit. Please try again.');
        }
    } catch (error) {
        console.error('Error toggling habit:', error);
        alert('Error updating habit. Please try again.');
    }
}

// Delete habit
async function deleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch('delete_habit.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `habit_id=${habitId}`
        });

        const data = await response.json();

        if (data.success) {
            // Remove from local array
            habits = habits.filter(habit => habit.id != habitId);
            habitLogs = habitLogs.filter(log => log.habit_id != habitId);

            // Update UI
            displayHabits();
            updateStats();
        } else {
            console.error('Error deleting habit:', data.message);
            alert('Error deleting habit. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting habit:', error);
        alert('Error deleting habit. Please try again.');
    }
}

// Update statistics
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayHabits = habits.filter(habit => shouldShowHabitToday(habit));
    const completedToday = todayHabits.filter(habit => isHabitCompletedToday(habit.id, today));

    document.getElementById('total-habits').textContent = habits.length;
    document.getElementById('completed-today').textContent = `${completedToday.length}/${todayHabits.length}`;

    // Calculate streak (simplified - consecutive days with at least one habit completed)
    const streak = calculateStreak();
    document.getElementById('current-streak').textContent = streak;
}

// Calculate current streak
function calculateStreak() {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) { // Check last 30 days
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toISOString().split('T')[0];

        const habitsForDate = habits.filter(habit => {
            // For simplicity, assume all habits existed on all dates
            return shouldShowHabitToday(habit);
        });

        const completedForDate = habitsForDate.filter(habit =>
            isHabitCompletedToday(habit.id, dateString)
        );

        if (completedForDate.length > 0) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Auto-refresh data every 5 minutes
setInterval(loadHabits, 5 * 60 * 1000);
