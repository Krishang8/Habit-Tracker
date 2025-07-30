<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/Habit%20Tracker%201.0/index.html');
}

// Get and sanitize input
$username = sanitize_input($_POST['username'] ?? '');
$email = sanitize_input($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$confirm_password = $_POST['confirm_password'] ?? '';

// Validation
$errors = [];

// Username validation
if (empty($username)) {
    $errors[] = 'Username is required';
} elseif (strlen($username) < 3) {
    $errors[] = 'Username must be at least 3 characters';
} elseif (strlen($username) > 50) {
    $errors[] = 'Username must be less than 50 characters';
} elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
    $errors[] = 'Username can only contain letters, numbers, and underscores';
}

// Email validation
if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format';
} elseif (strlen($email) > 100) {
    $errors[] = 'Email must be less than 100 characters';
}

// Password validation
if (empty($password)) {
    $errors[] = 'Password is required';
} elseif (strlen($password) < 6) {
    $errors[] = 'Password must be at least 6 characters';
} elseif (strlen($password) > 255) {
    $errors[] = 'Password is too long';
}

// Confirm password validation
if ($password !== $confirm_password) {
    $errors[] = 'Passwords do not match';
}

// If there are validation errors, redirect back with error
if (!empty($errors)) {
    redirect('/Habit%20Tracker%201.0/index.html?error=registration_failed');
}

try {
    $pdo = getConnection();

    // Check if username already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->rowCount() > 0) {
        redirect('/Habit%20Tracker%201.0/index.html?error=user_exists');
    }

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        redirect('/Habit%20Tracker%201.0/index.html?error=email_exists');
    }

    // Hash password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $pdo->prepare("
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
    ");

    if ($stmt->execute([$username, $email, $password_hash])) {
        // Registration successful
        redirect('/Habit%20Tracker%201.0/index.html?success=registered');
    } else {
        redirect('/Habit%20Tracker%201.0/index.html?error=registration_failed');
    }

} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());

    // Check for specific database errors
    if ($e->getCode() == 23000) { // Integrity constraint violation
        if (strpos($e->getMessage(), 'username') !== false) {
            redirect('/Habit%20Tracker%201.0/index.html?error=user_exists');
        } elseif (strpos($e->getMessage(), 'email') !== false) {
            redirect('/Habit%20Tracker%201.0/index.html?error=email_exists');
        }
    }

    redirect('/Habit%20Tracker%201.0/index.html?error=registration_failed');
}
?>
