-- HabitZen Database Schema
CREATE DATABASE IF NOT EXISTS habitzendb;
USE habitzendb;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#4A90E2',
    target_frequency INT DEFAULT 1, -- daily frequency target
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Habit completions table
CREATE TABLE IF NOT EXISTS habit_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habit_id INT NOT NULL,
    user_id INT NOT NULL,
    completion_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_completion (habit_id, completion_date)
);

-- Guest habits table (for non-logged in users using localStorage)
CREATE TABLE IF NOT EXISTS guest_habits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#4A90E2',
    target_frequency INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Guest habit completions
CREATE TABLE IF NOT EXISTS guest_habit_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habit_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    completion_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES guest_habits(id) ON DELETE CASCADE,
    UNIQUE KEY unique_guest_completion (habit_id, completion_date)
);

-- Insert some sample data for testing
INSERT INTO users (username, email, password) VALUES 
('demo_user', 'demo@habitizen.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: password

INSERT INTO habits (user_id, title, description, color) VALUES 
(1, 'Morning Run', 'Start the day with a 30-minute run', '#FF6B6B'),
(1, 'Read a Book', 'Read for at least 20 minutes daily', '#4ECDC4'),
(1, 'Meditation', 'Practice mindfulness meditation', '#45B7D1'),
(1, 'Drink Water', 'Drink 8 glasses of water daily', '#96CEB4'),
(1, 'Yoga', 'Practice yoga for flexibility and strength', '#FFEAA7'),
(1, 'Journal', 'Write down thoughts and reflections', '#DDA0DD');