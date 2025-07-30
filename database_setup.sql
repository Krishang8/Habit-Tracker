-- Habit Tracker Database Setup
-- Run this file in your MySQL database to create all necessary tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS habit_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE habit_tracker;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create habits table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS habit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habit_id INT NOT NULL,
    date_completed DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE KEY unique_habit_date (habit_id, date_completed),
    INDEX idx_habit_id (habit_id),
    INDEX idx_date_completed (date_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
-- You can uncomment these lines to add sample data for testing

/*
-- Sample user (password: test123)
INSERT INTO users (username, email, password_hash) VALUES 
('demo_user', 'demo@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Sample habits
INSERT INTO habits (user_id, title, description, frequency, category) VALUES 
(1, 'Drink 8 glasses of water', 'Stay hydrated throughout the day', 'daily', 'health'),
(1, 'Exercise for 30 minutes', 'Daily workout routine', 'daily', 'health'),
(1, 'Read for 20 minutes', 'Improve knowledge and vocabulary', 'daily', 'learning'),
(1, 'Meditate', 'Practice mindfulness and reduce stress', 'daily', 'mindfulness'),
(1, 'Call family member', 'Stay connected with family', 'weekly', 'social');

-- Sample habit logs (last 7 days)
INSERT INTO habit_logs (habit_id, date_completed) VALUES 
(1, CURDATE()),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
(2, CURDATE()),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(3, CURDATE()),
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY));
*/ 