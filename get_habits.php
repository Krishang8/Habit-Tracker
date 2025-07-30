<?php
require_once 'config.php';

// Set content type to JSON
header('Content-Type: application/json');

// Check if user is logged in
if (!isLoggedIn()) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}

try {
    $pdo = getConnection();
    $user_id = getCurrentUserId();

    // Get user's habits
    $stmt = $pdo->prepare("
        SELECT id, title, description, frequency, weekly_day, category, created_at
        FROM habits
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$user_id]);
    $habits = $stmt->fetchAll();

    // Get habit logs for the last 30 days
    $stmt = $pdo->prepare("
        SELECT hl.habit_id, hl.date_completed
        FROM habit_logs hl
        INNER JOIN habits h ON hl.habit_id = h.id
        WHERE h.user_id = ?
        AND hl.date_completed >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ORDER BY hl.date_completed DESC
    ");
    $stmt->execute([$user_id]);
    $logs = $stmt->fetchAll();

    // Return data
    echo json_encode([
        'success' => true,
        'habits' => $habits,
        'logs' => $logs
    ]);

} catch (PDOException $e) {
    error_log("Get habits error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
