<?php
require_once 'config.php';

// Destroy session
if (session_status() === PHP_SESSION_ACTIVE) {
    // Clear all session variables
    $_SESSION = array();

    // Delete the session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    // Destroy the session
    session_destroy();
}

// Redirect to home page
redirect('/Habit%20Tracker%201.0/index.html');
?>
