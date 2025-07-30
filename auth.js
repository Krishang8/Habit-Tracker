// Authentication JavaScript

// Tab switching functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab content
    document.getElementById(tabName + '-tab').classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    // Clear any existing error messages
    clearErrors();
}

// Clear error messages
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(error => {
        error.textContent = '';
        error.classList.remove('show');
    });
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password) {
    return password.length >= 6;
}

// Validate username
function isValidUsername(username) {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
}

// Login form validation and submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearErrors();

            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            // Basic validation
            if (!username) {
                showError('login-error', 'Please enter your username');
                return;
            }

            if (!password) {
                showError('login-error', 'Please enter your password');
                return;
            }

            // Submit form
            this.submit();
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearErrors();

            const username = document.getElementById('register-username').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            // Validation
            if (!username) {
                showError('register-error', 'Please enter a username');
                return;
            }

            if (!isValidUsername(username)) {
                showError('register-error', 'Username must be at least 3 characters and contain only letters, numbers, and underscores');
                return;
            }

            if (!email) {
                showError('register-error', 'Please enter your email');
                return;
            }

            if (!isValidEmail(email)) {
                showError('register-error', 'Please enter a valid email address');
                return;
            }

            if (!password) {
                showError('register-error', 'Please enter a password');
                return;
            }

            if (!isValidPassword(password)) {
                showError('register-error', 'Password must be at least 6 characters long');
                return;
            }

            if (password !== confirmPassword) {
                showError('register-error', 'Passwords do not match');
                return;
            }

            // Submit form
            this.submit();
        });
    }

    // Check for URL parameters to show messages
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const success = urlParams.get('success');

    if (error) {
        if (error === 'invalid_credentials') {
            showError('login-error', 'Invalid username or password');
        } else if (error === 'user_exists') {
            showTab('register');
            showError('register-error', 'Username already exists');
        } else if (error === 'email_exists') {
            showTab('register');
            showError('register-error', 'Email already registered');
        } else if (error === 'registration_failed') {
            showTab('register');
            showError('register-error', 'Registration failed. Please try again.');
        }
    }

    if (success === 'registered') {
        showError('login-error', 'Registration successful! Please log in.');
        document.getElementById('login-error').style.color = '#27ae60';
        document.getElementById('login-error').style.backgroundColor = '#d5f4e6';
        document.getElementById('login-error').style.borderColor = '#82e0aa';
    }
});

// Real-time validation feedback
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('register-username');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');

    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            const username = this.value.trim();
            if (username && !isValidUsername(username)) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#e1e8ed';
            }
        });
    }

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !isValidEmail(email)) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#e1e8ed';
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            if (password && !isValidPassword(password)) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#e1e8ed';
            }
        });
    }

    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = passwordInput.value;
            const confirmPassword = this.value;
            if (confirmPassword && password !== confirmPassword) {
                this.style.borderColor = '#e74c3c';
            } else {
                this.style.borderColor = '#e1e8ed';
            }
        });
    }
});
