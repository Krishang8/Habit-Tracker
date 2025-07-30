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

// Validation
if ($habit_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid habit ID']);
    exit();
}

try {
    $pdo = getConnection();
    $user_id = getCurrentUserId();

    // Verify that the habit belongs to the current user
    $stmt = $pdo->prepare("SELECT id, title FROM habits WHERE id = ? AND user_id = ?");
    $stmt->execute([$habit_id, $user_id]);
    $habit = $stmt->fetch();

    if (!$habit) {
        echo json_encode(['success' => false, 'message' => 'Habit not found']);
        exit();
    }

    // Start transaction
    $pdo->beginTransaction();

    try {
        // Delete habit logs first (due to foreign key constraint)
        $stmt = $pdo->prepare("DELETE FROM habit_logs WHERE habit_id = ?");
        $stmt->execute([$habit_id]);

        // Delete the habit
        $stmt = $pdo->prepare("DELETE FROM habits WHERE id = ? AND user_id = ?");
        $result = $stmt->execute([$habit_id, $user_id]);

        if ($result && $stmt->rowCount() > 0) {
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Habit deleted successfully']);
        } else {
            $pdo->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to delete habit']);
        }

    } catch (Exception $e) {
        $pdo->rollback();
        throw $e;
    }

} catch (PDOException $e) {
    error_log("Delete habit error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
