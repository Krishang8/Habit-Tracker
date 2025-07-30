// Habit Log JavaScript

let habits = [];
let habitLogs = [];
let currentDate = new Date();
let selectedDate = new Date();
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Initialize page when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// Initialize the page
async function initializePage() {
    await loadUserData();
    await loadHabits();
    setupDateSelector();
    generateCalendar();
    updateHabitsForDate(selectedDate);
    updateProgressSummary();
}

// Load user data
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
        } else {
            console.error('Error loading habits:', data.message);
        }
    } catch (error) {
        console.error('Error loading habits:', error);
    }
}

// Setup date selector
function setupDateSelector() {
    const dateInput = document.getElementById('selected-date');
    
    // Set initial date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Listen for date changes
    dateInput.addEventListener('change', function() {
        selectedDate = new Date(this.value);
        updateHabitsForDate(selectedDate);
        updateCalendarSelection();
    });
}

// Generate calendar
function generateCalendar() {
    const calendar = document.getElementById('calendar');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Update month header
    document.getElementById('calendar-month').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate calendar days
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Check if it's current month
        if (date.getMonth() !== currentMonth) {
            dayElement.classList.add('other-month');
        }
        
        // Check if it's today
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Check if it's selected date
        if (date.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        // Add day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);
        
        // Add habit indicators
        const dayHabits = document.createElement('div');
        dayHabits.className = 'day-habits';
        const completedCount = getCompletedHabitsForDate(date);
        const totalCount = getTotalHabitsForDate(date);
        
        if (totalCount > 0) {
            dayHabits.textContent = `${completedCount}/${totalCount}`;
            if (completedCount === totalCount) {
                dayElement.style.backgroundColor = '#d5f4e6';
            }
        }
        dayElement.appendChild(dayHabits);
        
        // Add click event
        dayElement.addEventListener('click', function() {
            selectedDate = new Date(date);
            updateHabitsForDate(selectedDate);
            updateCalendarSelection();
            updateDateSelector();
        });
        
        calendar.appendChild(dayElement);
    }
}

// Update calendar selection
function updateCalendarSelection() {
    const days = document.querySelectorAll('.calendar-day');
    days.forEach(day => day.classList.remove('selected'));
    
    const selectedDay = Array.from(days).find(day => {
        const dayNumber = day.querySelector('.day-number').textContent;
        const date = new Date(currentYear, currentMonth, parseInt(dayNumber));
        return date.toDateString() === selectedDate.toDateString();
    });
    
    if (selectedDay) {
        selectedDay.classList.add('selected');
    }
}

// Update date selector
function updateDateSelector() {
    const dateInput = document.getElementById('selected-date');
    dateInput.value = selectedDate.toISOString().split('T')[0];
}

// Navigation functions
function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar();
}

function goToToday() {
    selectedDate = new Date();
    currentMonth = selectedDate.getMonth();
    currentYear = selectedDate.getFullYear();
    generateCalendar();
    updateHabitsForDate(selectedDate);
    updateDateSelector();
}

// Get completed habits for a specific date
function getCompletedHabitsForDate(date) {
    const dateString = date.toISOString().split('T')[0];
    return habitLogs.filter(log => log.date_completed === dateString).length;
}

// Get total habits for a specific date
function getTotalHabitsForDate(date) {
    return habits.filter(habit => shouldShowHabitOnDate(habit, date)).length;
}

// Check if habit should be shown on a specific date
function shouldShowHabitOnDate(habit, date) {
    if (habit.frequency === 'daily') {
        return true;
    }
    
    if (habit.frequency === 'weekly') {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
        return habit.weekly_day === dayName;
    }
    
    return true;
}

// Update habits display for selected date
function updateHabitsForDate(date) {
    const habitsList = document.getElementById('habits-log-list');
    const dateHeader = document.getElementById('habits-date-header');
    
    // Update header
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateHeader.textContent = `Habits for ${date.toLocaleDateString('en-US', options)}`;
    
    // Filter habits for this date
    const dateHabits = habits.filter(habit => shouldShowHabitOnDate(habit, date));
    
    if (dateHabits.length === 0) {
        habitsList.innerHTML = '<p>No habits scheduled for this date.</p>';
        return;
    }
    
    const dateString = date.toISOString().split('T')[0];
    
    habitsList.innerHTML = dateHabits.map(habit => {
        const isCompleted = isHabitCompletedOnDate(habit.id, dateString);
        
        return `
            <div class="habit-log-item ${isCompleted ? 'completed' : ''}" data-habit-id="${habit.id}">
                <div class="habit-info">
                    <div class="habit-title">${escapeHtml(habit.title)}</div>
                    <div class="habit-meta">
                        ${habit.frequency} • ${capitalize(habit.category || 'Other')}
                        ${habit.description ? `• ${escapeHtml(habit.description)}` : ''}
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="log-btn ${isCompleted ? 'undo' : 'complete'}" 
                            onclick="toggleHabitCompletion(${habit.id}, this)">
                        ${isCompleted ? 'Undo' : 'Complete'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Check if habit is completed on a specific date
function isHabitCompletedOnDate(habitId, date) {
    return habitLogs.some(log =>
        log.habit_id == habitId && log.date_completed === date
    );
}

// Toggle habit completion
async function toggleHabitCompletion(habitId, buttonElement) {
    const dateString = selectedDate.toISOString().split('T')[0];
    const isCompleted = isHabitCompletedOnDate(habitId, dateString);
    
    try {
        const response = await fetch('toggle_habit.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `habit_id=${habitId}&date=${dateString}&action=${isCompleted ? 'uncomplete' : 'complete'}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local data
            if (isCompleted) {
                // Remove from logs
                habitLogs = habitLogs.filter(log =>
                    !(log.habit_id == habitId && log.date_completed === dateString)
                );
            } else {
                // Add to logs
                habitLogs.push({
                    habit_id: habitId,
                    date_completed: dateString
                });
            }
            
            // Update UI
            const habitItem = buttonElement.closest('.habit-log-item');
            if (isCompleted) {
                habitItem.classList.remove('completed');
                buttonElement.textContent = 'Complete';
                buttonElement.className = 'log-btn complete';
            } else {
                habitItem.classList.add('completed');
                buttonElement.textContent = 'Undo';
                buttonElement.className = 'log-btn undo';
            }
            
            // Update calendar and progress
            generateCalendar();
            updateProgressSummary();
            
        } else {
            console.error('Error toggling habit:', data.message);
            alert('Error updating habit. Please try again.');
        }
    } catch (error) {
        console.error('Error toggling habit:', error);
        alert('Error updating habit. Please try again.');
    }
}

// Complete all habits for selected date
async function completeAllHabits() {
    const dateString = selectedDate.toISOString().split('T')[0];
    const dateHabits = habits.filter(habit => shouldShowHabitOnDate(habit, selectedDate));
    const incompleteHabits = dateHabits.filter(habit => !isHabitCompletedOnDate(habit.id, dateString));
    
    if (incompleteHabits.length === 0) {
        alert('All habits are already completed for this date!');
        return;
    }
    
    if (!confirm(`Complete all ${incompleteHabits.length} habits for this date?`)) {
        return;
    }
    
    // Complete all habits
    for (const habit of incompleteHabits) {
        try {
            const response = await fetch('toggle_habit.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `habit_id=${habit.id}&date=${dateString}&action=complete`
            });
            
            const data = await response.json();
            if (data.success) {
                habitLogs.push({
                    habit_id: habit.id,
                    date_completed: dateString
                });
            }
        } catch (error) {
            console.error(`Error completing habit ${habit.id}:`, error);
        }
    }
    
    // Refresh display
    updateHabitsForDate(selectedDate);
    generateCalendar();
    updateProgressSummary();
}

// Clear all habits for selected date
async function clearAllHabits() {
    const dateString = selectedDate.toISOString().split('T')[0];
    const completedHabits = habitLogs.filter(log => log.date_completed === dateString);
    
    if (completedHabits.length === 0) {
        alert('No habits are completed for this date!');
        return;
    }
    
    if (!confirm(`Clear all ${completedHabits.length} completed habits for this date?`)) {
        return;
    }
    
    // Clear all habits
    for (const log of completedHabits) {
        try {
            const response = await fetch('toggle_habit.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `habit_id=${log.habit_id}&date=${dateString}&action=uncomplete`
            });
            
            const data = await response.json();
            if (data.success) {
                habitLogs = habitLogs.filter(l => 
                    !(l.habit_id == log.habit_id && l.date_completed === dateString)
                );
            }
        } catch (error) {
            console.error(`Error clearing habit ${log.habit_id}:`, error);
        }
    }
    
    // Refresh display
    updateHabitsForDate(selectedDate);
    generateCalendar();
    updateProgressSummary();
}

// Update progress summary
function updateProgressSummary() {
    const today = new Date().toISOString().split('T')[0];
    const todayHabits = habits.filter(habit => shouldShowHabitOnDate(habit, new Date()));
    const completedToday = todayHabits.filter(habit => isHabitCompletedOnDate(habit.id, today));
    
    document.getElementById('total-habits-count').textContent = habits.length;
    document.getElementById('completed-habits-count').textContent = completedToday.length;
    
    const completionRate = todayHabits.length > 0 ? Math.round((completedToday.length / todayHabits.length) * 100) : 0;
    document.getElementById('completion-rate').textContent = `${completionRate}%`;
    
    const streak = calculateStreak();
    document.getElementById('current-streak').textContent = streak;
}

// Calculate current streak
function calculateStreak() {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toISOString().split('T')[0];
        
        const habitsForDate = habits.filter(habit => shouldShowHabitOnDate(habit, checkDate));
        const completedForDate = habitsForDate.filter(habit =>
            isHabitCompletedOnDate(habit.id, dateString)
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