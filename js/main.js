// Main JavaScript file for HabitZen

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function switchModal(currentModalId, targetModalId) {
    closeModal(currentModalId);
    setTimeout(() => openModal(targetModalId), 100);
}

// Color picker functions
function setColor(color) {
    document.getElementById('habitColor').value = color;
}

function setEditColor(color) {
    document.getElementById('editHabitColor').value = color;
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal with escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
});

// Utility functions
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ffa8a8 100%)';
            break;
        case 'info':
            notification.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Loading state management
function setLoadingState(element, isLoading) {
    if (isLoading) {
        element.classList.add('btn-loading');
        element.disabled = true;
        element.dataset.originalText = element.textContent;
        element.textContent = '';
    } else {
        element.classList.remove('btn-loading');
        element.disabled = false;
        element.textContent = element.dataset.originalText || element.textContent;
    }
}

// Format date function
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Check if date is today
function isToday(dateString) {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
}

// Get today's date in YYYY-MM-DD format
function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Validate form data
function validateForm(formData) {
    const errors = [];
    
    if (!formData.title || formData.title.trim().length < 2) {
        errors.push('Habit name must be at least 2 characters long');
    }
    
    if (formData.title && formData.title.length > 100) {
        errors.push('Habit name must be less than 100 characters');
    }
    
    if (formData.description && formData.description.length > 500) {
        errors.push('Description must be less than 500 characters');
    }
    
    return errors;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status on page load
    checkAuthStatus();
    
    // Initialize habits if on tracker page
    if (window.location.pathname.includes('tracker.php') || window.location.pathname.includes('tracker')) {
        initializeTracker();
    }
    
    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Check authentication status
function checkAuthStatus() {
    // This will be handled by the auth.js file
    // but we can add any additional UI updates here
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (typeof isLoggedIn !== 'undefined' && isLoggedIn) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// Initialize tracker page
function initializeTracker() {
    const habitsGrid = document.getElementById('habitsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!habitsGrid) return;
    
    // Check if we need to show empty state
    const habitCards = habitsGrid.querySelectorAll('.habit-card');
    if (habitCards.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
    } else {
        if (emptyState) emptyState.style.display = 'none';
    }
    
    // Load guest habits if not logged in
    if (typeof isLoggedIn !== 'undefined' && !isLoggedIn) {
        loadGuestHabits();
    }
}

// Guest habits management (localStorage)
function loadGuestHabits() {
    const guestHabits = JSON.parse(localStorage.getItem('guestHabits') || '[]');
    const habitsGrid = document.getElementById('habitsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!habitsGrid) return;
    
    // Clear existing habits
    habitsGrid.innerHTML = '';
    
    if (guestHabits.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    guestHabits.forEach((habit, index) => {
        const habitCard = createHabitCard(habit, index);
        habitsGrid.appendChild(habitCard);
    });
}

function createHabitCard(habit, index) {
    const card = document.createElement('div');
    card.className = 'habit-card';
    card.dataset.habitId = habit.id || index;
    
    const completions = JSON.parse(localStorage.getItem('guestCompletions') || '[]');
    const todayCompletion = completions.find(c => 
        c.habitId === (habit.id || index) && c.date === getTodayString()
    );
    const isCompleted = !!todayCompletion;
    
    card.innerHTML = `
        <div class="habit-header">
            <h3>${escapeHtml(habit.title)}</h3>
            <div class="habit-actions">
                <button class="btn-icon" onclick="editGuestHabit(${habit.id || index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" onclick="deleteGuestHabit(${habit.id || index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <p class="habit-description">${escapeHtml(habit.description || '')}</p>
        <div class="habit-footer">
            <button class="btn-complete ${isCompleted ? 'completed' : ''}" 
                    onclick="toggleGuestHabitCompletion(${habit.id || index})">
                <i class="fas fa-check"></i>
                ${isCompleted ? 'Completed' : 'Complete'}
            </button>
            <button class="btn-delete" onclick="deleteGuestHabit(${habit.id || index})">
                Delete
            </button>
        </div>
    `;
    
    return card;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Guest habit functions (will be expanded in habits.js)
function toggleGuestHabitCompletion(habitId) {
    // This will be implemented in habits.js
    console.log('Toggle guest habit completion:', habitId);
}

function editGuestHabit(habitId) {
    // This will be implemented in habits.js
    console.log('Edit guest habit:', habitId);
}

function deleteGuestHabit(habitId) {
    // This will be implemented in habits.js
    console.log('Delete guest habit:', habitId);
}

// Analytics helper functions
function calculateStreak(completions, habitId) {
    if (!completions || completions.length === 0) return 0;
    
    const habitCompletions = completions
        .filter(c => c.habitId === habitId)
        .map(c => new Date(c.date))
        .sort((a, b) => b - a);
    
    if (habitCompletions.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let completion of habitCompletions) {
        completion.setHours(0, 0, 0, 0);
        const diffTime = currentDate - completion;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (diffDays === streak + 1) {
            // Allow for today not being completed yet
            if (streak === 0) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        } else {
            break;
        }
    }
    
    return streak;
}

// Export functions for use in other files
window.HabitZen = {
    openModal,
    closeModal,
    switchModal,
    setColor,
    setEditColor,
    showNotification,
    setLoadingState,
    formatDate,
    isToday,
    getTodayString,
    validateForm,
    escapeHtml,
    calculateStreak,
    loadGuestHabits,
    createHabitCard
};