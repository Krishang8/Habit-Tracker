<?php
require_once 'config.php';

// Set content type to JSON
header('Content-Type: application/json');

// Check if user is logged in
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit();
}

// Get and validate input
$habit_id = intval($_POST['habit_id'] ?? 0);
$date = sanitize_input($_POST['date'] ?? '');
$action = sanitize_input($_POST['action'] ?? '');

// Validation
if ($habit_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid habit ID']);
    exit();
}

if (empty($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    echo json_encode(['success' => false, 'message' => 'Invalid date format']);
    exit();
}

if (!in_array($action, ['complete', 'uncomplete'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit();
}

try {
    $pdo = getConnection();
    $user_id = getCurrentUserId();

    // Verify that the habit belongs to the current user
    $stmt = $pdo->prepare("SELECT id FROM habits WHERE id = ? AND user_id = ?");
    $stmt->execute([$habit_id, $user_id]);
    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Habit not found']);
        exit();
    }

    if ($action === 'complete') {
        // Mark habit as complete for the date
        $stmt = $pdo->prepare("
            INSERT INTO habit_logs (habit_id, date_completed)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE habit_id = habit_id
        ");
        $result = $stmt->execute([$habit_id, $date]);

    } else {
        // Remove completion for the date
        $stmt = $pdo->prepare("
            DELETE FROM habit_logs
            WHERE habit_id = ? AND date_completed = ?
        ");
        $result = $stmt->execute([$habit_id, $date]);
    }

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Habit updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update habit']);
    }

} catch (PDOException $e) {
    error_log("Toggle habit error: " . $e->getMessage());

    // Handle duplicate key error (trying to complete already completed habit)
    if ($e->getCode() == 23000 && strpos($e->getMessage(), 'unique_habit_date') !== false) {
        echo json_encode(['success' => true, 'message' => 'Habit already completed for this date']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
}
?>
