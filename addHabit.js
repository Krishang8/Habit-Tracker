// Add Habit JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const habitForm = document.getElementById('habit-form');
    const frequencySelect = document.getElementById('habit-frequency');
    const weeklyDayGroup = document.getElementById('weekly-day-group');

    // Handle frequency change to show/hide weekly day selector
    frequencySelect.addEventListener('change', function() {
        if (this.value === 'weekly') {
            weeklyDayGroup.style.display = 'block';
            document.getElementById('weekly-day').required = true;
        } else {
            weeklyDayGroup.style.display = 'none';
            document.getElementById('weekly-day').required = false;
        }
    });

    // Handle form submission
    habitForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();

        if (validateForm()) {
            this.submit();
        }
    });

    // Real-time validation
    setupRealTimeValidation();
});

// Form validation
function validateForm() {
    const title = document.getElementById('habit-title').value.trim();
    const frequency = document.getElementById('habit-frequency').value;
    const weeklyDay = document.getElementById('weekly-day').value;

    // Title validation
    if (!title) {
        showError('Please enter a habit name');
        document.getElementById('habit-title').focus();
        return false;
    }

    if (title.length < 3) {
        showError('Habit name must be at least 3 characters long');
        document.getElementById('habit-title').focus();
        return false;
    }

    if (title.length > 100) {
        showError('Habit name must be less than 100 characters');
        document.getElementById('habit-title').focus();
        return false;
    }

    // Frequency validation
    if (!frequency) {
        showError('Please select a frequency');
        document.getElementById('habit-frequency').focus();
        return false;
    }

    // Weekly day validation
    if (frequency === 'weekly' && !weeklyDay) {
        showError('Please select a day for weekly habits');
        document.getElementById('weekly-day').focus();
        return false;
    }

    // Description validation (optional but length check)
    const description = document.getElementById('habit-description').value.trim();
    if (description && description.length > 500) {
        showError('Description must be less than 500 characters');
        document.getElementById('habit-description').focus();
        return false;
    }

    return true;
}

// Real-time validation setup
function setupRealTimeValidation() {
    const titleInput = document.getElementById('habit-title');
    const descriptionInput = document.getElementById('habit-description');

    // Title validation
    titleInput.addEventListener('blur', function() {
        const title = this.value.trim();
        if (title && (title.length < 3 || title.length > 100)) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#e1e8ed';
        }
    });

    titleInput.addEventListener('input', function() {
        const title = this.value.trim();
        if (title.length > 100) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#e1e8ed';
        }
    });

    // Description validation
    descriptionInput.addEventListener('input', function() {
        const description = this.value.trim();
        if (description.length > 500) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#e1e8ed';
        }
    });
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('form-error');
    errorElement.textContent = message;
    errorElement.classList.add('show');

    // Scroll to error message
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Clear error messages
function clearErrors() {
    const errorElement = document.getElementById('form-error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}

// Handle URL parameters for success/error messages
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'habit_added') {
        // Show success message and redirect to dashboard after 2 seconds
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = 'Habit added successfully! Redirecting to dashboard...';

        const form = document.querySelector('.habit-form');
        form.insertBefore(successDiv, form.firstChild);

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    if (error) {
        let errorMessage = 'An error occurred. Please try again.';

        switch (error) {
            case 'missing_fields':
                errorMessage = 'Please fill in all required fields.';
                break;
            case 'invalid_frequency':
                errorMessage = 'Please select a valid frequency.';
                break;
            case 'title_too_long':
                errorMessage = 'Habit name is too long.';
                break;
            case 'database_error':
                errorMessage = 'Database error. Please try again later.';
                break;
        }

        showError(errorMessage);
    }
});

// Character counter for description
document.addEventListener('DOMContentLoaded', function() {
    const descriptionInput = document.getElementById('habit-description');
    const maxLength = 500;

    // Create character counter
    const counter = document.createElement('div');
    counter.style.textAlign = 'right';
    counter.style.fontSize = '0.8rem';
    counter.style.color = '#95a5a6';
    counter.style.marginTop = '5px';

    descriptionInput.parentNode.appendChild(counter);

    function updateCounter() {
        const remaining = maxLength - descriptionInput.value.length;
        counter.textContent = `${remaining} characters remaining`;

        if (remaining < 50) {
            counter.style.color = '#e74c3c';
        } else {
            counter.style.color = '#95a5a6';
        }
    }

    descriptionInput.addEventListener('input', updateCounter);
    updateCounter(); // Initial call
});
