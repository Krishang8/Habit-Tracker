<?php
require_once 'config.php';

// Check if user is logged in
requireLogin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/Habit%20Tracker%201.0/addHabit.html');
}

// Get and sanitize input
$title = sanitize_input($_POST['title'] ?? '');
$description = sanitize_input($_POST['description'] ?? '');
$frequency = sanitize_input($_POST['frequency'] ?? '');
$weekly_day = sanitize_input($_POST['weekly_day'] ?? '');
$category = sanitize_input($_POST['category'] ?? 'other');

// Validation
$errors = [];

// Title validation
if (empty($title)) {
    $errors[] = 'Habit name is required';
} elseif (strlen($title) < 3) {
    $errors[] = 'Habit name must be at least 3 characters';
} elseif (strlen($title) > 100) {
    $errors[] = 'Habit name must be less than 100 characters';
}

// Frequency validation
$valid_frequencies = ['daily', 'weekly'];
if (empty($frequency)) {
    $errors[] = 'Frequency is required';
} elseif (!in_array($frequency, $valid_frequencies)) {
    $errors[] = 'Invalid frequency selected';
}

// Weekly day validation
if ($frequency === 'weekly') {
    $valid_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (empty($weekly_day) || !in_array($weekly_day, $valid_days)) {
        $errors[] = 'Please select a valid day for weekly habits';
    }
} else {
    $weekly_day = null; // Clear weekly_day for daily habits
}

// Description validation (optional)
if (strlen($description) > 500) {
    $errors[] = 'Description must be less than 500 characters';
}

// Category validation
$valid_categories = ['health', 'productivity', 'learning', 'mindfulness', 'social', 'other'];
if (!in_array($category, $valid_categories)) {
    $category = 'other';
}

// If there are validation errors, redirect back
if (!empty($errors)) {
    redirect('/Habit%20Tracker%201.0/addHabit.html?error=missing_fields');
}

try {
    $pdo = getConnection();
    $user_id = getCurrentUserId();

    // Check if user already has a habit with the same title
    $stmt = $pdo->prepare("SELECT id FROM habits WHERE user_id = ? AND title = ?");
    $stmt->execute([$user_id, $title]);
    if ($stmt->rowCount() > 0) {
        redirect('/Habit%20Tracker%201.0/addHabit.html?error=habit_exists');
    }

    // Insert new habit
    $stmt = $pdo->prepare("
        INSERT INTO habits (user_id, title, description, frequency, weekly_day, category)
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    $result = $stmt->execute([
        $user_id,
        $title,
        empty($description) ? null : $description,
        $frequency,
        $weekly_day,
        $category
    ]);

    if ($result) {
        // Habit added successfully
        redirect('/Habit%20Tracker%201.0/addHabit.html?success=habit_added');
    } else {
        redirect('/Habit%20Tracker%201.0/addHabit.html?error=database_error');
    }

} catch (PDOException $e) {
    error_log("Add habit error: " . $e->getMessage());
    redirect('/Habit%20Tracker%201.0/addHabit.html?error=database_error');
}
?>
