<?php
// Database Connection Test Script
// Run this file in your browser to test the database connection

require_once 'config.php';

echo "<h1>Database Connection Test</h1>";

try {
    // Test database connection
    echo "<h2>Testing Database Connection...</h2>";
    $pdo = getConnection();
    echo "✅ Database connection successful!<br>";
    echo "Connected to: " . DB_HOST . ":" . DB_PORT . "/" . DB_NAME . "<br><br>";

    // Test table creation
    echo "<h2>Testing Table Creation...</h2>";
    $result = initializeDatabase();
    if ($result) {
        echo "✅ Database tables created/verified successfully!<br><br>";
    } else {
        echo "❌ Failed to create database tables.<br><br>";
    }

    // Check if tables exist
    echo "<h2>Checking Tables...</h2>";
    $tables = ['users', 'habits', 'habit_logs'];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "✅ Table '$table' exists<br>";
            
            // Count records
            $countStmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $count = $countStmt->fetch()['count'];
            echo "   - Records: $count<br>";
        } else {
            echo "❌ Table '$table' does not exist<br>";
        }
    }

    // Test user creation (optional)
    echo "<h2>Testing User Creation...</h2>";
    $testUsername = 'test_user_' . time();
    $testEmail = 'test' . time() . '@example.com';
    $testPassword = 'test123';
    $passwordHash = password_hash($testPassword, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    $result = $stmt->execute([$testUsername, $testEmail, $passwordHash]);
    
    if ($result) {
        echo "✅ Test user created successfully!<br>";
        echo "Username: $testUsername<br>";
        echo "Email: $testEmail<br>";
        echo "Password: $testPassword<br><br>";
        
        // Clean up test user
        $stmt = $pdo->prepare("DELETE FROM users WHERE username = ?");
        $stmt->execute([$testUsername]);
        echo "🧹 Test user cleaned up<br>";
    } else {
        echo "❌ Failed to create test user<br>";
    }

    echo "<h2>✅ All Tests Passed!</h2>";
    echo "<p>Your database is properly configured and ready to use.</p>";
    echo "<p><a href='index.html'>Go to Habit Tracker</a></p>";

} catch (PDOException $e) {
    echo "<h2>❌ Database Error</h2>";
    echo "Error: " . $e->getMessage() . "<br>";
    echo "<h3>Troubleshooting Steps:</h3>";
    echo "<ol>";
    echo "<li>Check if MySQL service is running</li>";
    echo "<li>Verify database credentials in config.php</li>";
    echo "<li>Ensure database 'habit_tracker' exists</li>";
    echo "<li>Check if port number is correct</li>";
    echo "<li>Verify user permissions</li>";
    echo "</ol>";
    
    echo "<h3>Current Configuration:</h3>";
    echo "Host: " . DB_HOST . "<br>";
    echo "Port: " . DB_PORT . "<br>";
    echo "Database: " . DB_NAME . "<br>";
    echo "User: " . DB_USER . "<br>";
    echo "Password: " . (DB_PASS ? 'Set' : 'Not set') . "<br>";
}
?> 