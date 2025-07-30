<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/Habit%20Tracker%201.0/index.html');
}

// Get and sanitize input
$username = sanitize_input($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

// Basic validation
if (empty($username) || empty($password)) {
    redirect('/Habit%20Tracker%201.0/index.html?error=invalid_credentials');
}

try {
    $pdo = getConnection();

    // Get user by username
    $stmt = $pdo->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        // User not found
        redirect('/Habit%20Tracker%201.0/index.html?error=invalid_credentials');
    }

    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        // Invalid password
        redirect('/Habit%20Tracker%201.0/index.html?error=invalid_credentials');
    }

    // Login successful - create session
    session_regenerate_id(true); // Prevent session fixation
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['logged_in'] = true;
    $_SESSION['login_time'] = time();

    // Redirect to dashboard
    redirect('/Habit%20Tracker%201.0/dashboard.html');

} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    redirect('/Habit%20Tracker%201.0/index.html?error=login_failed');
}
?>
