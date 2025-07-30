<?php
// Database configuration for MAMP
define('DB_HOST', 'localhost');
define('DB_NAME', 'habit_tracker');
define('DB_USER', 'root');
define('DB_PASS', 'root'); // Default MAMP password
define('DB_PORT', '8889'); // Default MAMP MySQL port

// Create database connection
function getConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection failed: " . $e->getMessage());
        die("Database connection failed. Please check your configuration.");
    }
}

// Initialize database and create tables if they don't exist
function initializeDatabase() {
    try {
        // First, create the database if it doesn't exist
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);

        $pdo->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

        // Now connect to the specific database
        $pdo = getConnection();

        // Create users table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create habits table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS habits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                frequency ENUM('daily', 'weekly') NOT NULL DEFAULT 'daily',
                weekly_day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NULL,
                category VARCHAR(50) DEFAULT 'other',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_frequency (frequency)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        // Create habit_logs table
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS habit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                habit_id INT NOT NULL,
                date_completed DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
                UNIQUE KEY unique_habit_date (habit_id, date_completed),
                INDEX idx_habit_id (habit_id),
                INDEX idx_date_completed (date_completed)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");

        return true;
    } catch (PDOException $e) {
        error_log("Database initialization failed: " . $e->getMessage());
        return false;
    }
}

// Session configuration
session_start();

// Security settings
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS

// Utility functions
function sanitize_input($data) {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function redirect($url) {
    header("Location: $url");
    exit();
}

function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        redirect('/Habit%20Tracker%201.0/index.html?error=login_required');
    }
}

function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

// Error handling
function handleError($message, $redirect_url = null) {
    error_log($message);
    if ($redirect_url) {
        redirect($redirect_url . '?error=database_error');
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'An error occurred']);
        exit();
    }
}

// Initialize database on first load
if (!file_exists('../.db_initialized')) {
    if (initializeDatabase()) {
        file_put_contents('../.db_initialized', 'Database initialized at ' . date('Y-m-d H:i:s'));
    }
}
?>
