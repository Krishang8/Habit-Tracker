<?php
require_once 'config/database.php';

// Get user habits or guest habits
$habits = [];
if (isLoggedIn()) {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT * FROM habits WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC");
    $stmt->execute([getCurrentUserId()]);
    $habits = $stmt->fetchAll();
} else {
    // For guests, we'll load habits via JavaScript from localStorage
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Habit Tracker - HabitZen</title>
    <link rel="stylesheet" href="css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <i class="fas fa-seedling"></i>
                <span>HabitZen</span>
            </div>
            <div class="nav-menu">
                <a href="index.html" class="nav-link">Home</a>
                <a href="tracker.php" class="nav-link active">Habit Tracker</a>
                <a href="#" class="nav-link">Settings</a>
                <div class="auth-buttons" id="authButtons" <?php echo isLoggedIn() ? 'style="display: none;"' : ''; ?>>
                    <button class="btn-secondary" onclick="openModal('loginModal')">Login</button>
                    <button class="btn-primary" onclick="openModal('registerModal')">Get Started</button>
                </div>
                <div class="user-menu" id="userMenu" <?php echo !isLoggedIn() ? 'style="display: none;"' : ''; ?>>
                    <span id="username"><?php echo $_SESSION['username'] ?? ''; ?></span>
                    <button class="btn-secondary" onclick="logout()">Logout</button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="tracker-main">
        <div class="container">
            <div class="tracker-header">
                <h1>Your Habits</h1>
                <p>Track your daily progress and build lasting habits</p>
            </div>

            <!-- Habits Grid -->
            <div class="habits-grid" id="habitsGrid">
                <?php if (isLoggedIn() && !empty($habits)): ?>
                    <?php foreach ($habits as $habit): ?>
                        <div class="habit-card" data-habit-id="<?php echo $habit['id']; ?>">
                            <div class="habit-header">
                                <h3><?php echo htmlspecialchars($habit['title']); ?></h3>
                                <div class="habit-actions">
                                    <button class="btn-icon" onclick="editHabit(<?php echo $habit['id']; ?>)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon delete" onclick="deleteHabit(<?php echo $habit['id']; ?>)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <p class="habit-description"><?php echo htmlspecialchars($habit['description']); ?></p>
                            <div class="habit-footer">
                                <button class="btn-complete" onclick="toggleHabitCompletion(<?php echo $habit['id']; ?>)">
                                    <i class="fas fa-check"></i>
                                    Complete
                                </button>
                                <button class="btn-delete" onclick="deleteHabit(<?php echo $habit['id']; ?>)">
                                    Delete
                                </button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <!-- Add New Habit Button -->
            <div class="add-habit-section">
                <button class="btn-add-habit" onclick="openModal('addHabitModal')">
                    <i class="fas fa-plus"></i>
                    Add New Habit
                </button>
            </div>

            <!-- Empty State -->
            <div class="empty-state" id="emptyState" style="display: none;">
                <i class="fas fa-seedling"></i>
                <h3>No habits yet</h3>
                <p>Start building better habits by adding your first one!</p>
                <button class="btn-primary" onclick="openModal('addHabitModal')">Add Your First Habit</button>
            </div>
        </div>
    </main>

    <!-- Add Habit Modal -->
    <div id="addHabitModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('addHabitModal')">&times;</span>
            <h2>Add New Habit</h2>
            <form id="addHabitForm">
                <div class="form-group">
                    <label for="habitTitle">Habit Name:</label>
                    <input type="text" id="habitTitle" name="title" required placeholder="e.g., Morning Run">
                </div>
                <div class="form-group">
                    <label for="habitDescription">Description:</label>
                    <textarea id="habitDescription" name="description" placeholder="Describe your habit..."></textarea>
                </div>
                <div class="form-group">
                    <label for="habitColor">Color:</label>
                    <div class="color-picker">
                        <input type="color" id="habitColor" name="color" value="#4A90E2">
                        <div class="color-presets">
                            <div class="color-preset" style="background: #FF6B6B" onclick="setColor('#FF6B6B')"></div>
                            <div class="color-preset" style="background: #4ECDC4" onclick="setColor('#4ECDC4')"></div>
                            <div class="color-preset" style="background: #45B7D1" onclick="setColor('#45B7D1')"></div>
                            <div class="color-preset" style="background: #96CEB4" onclick="setColor('#96CEB4')"></div>
                            <div class="color-preset" style="background: #FFEAA7" onclick="setColor('#FFEAA7')"></div>
                            <div class="color-preset" style="background: #DDA0DD" onclick="setColor('#DDA0DD')"></div>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn-primary">Add Habit</button>
            </form>
        </div>
    </div>

    <!-- Edit Habit Modal -->
    <div id="editHabitModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('editHabitModal')">&times;</span>
            <h2>Edit Habit</h2>
            <form id="editHabitForm">
                <input type="hidden" id="editHabitId" name="habit_id">
                <div class="form-group">
                    <label for="editHabitTitle">Habit Name:</label>
                    <input type="text" id="editHabitTitle" name="title" required>
                </div>
                <div class="form-group">
                    <label for="editHabitDescription">Description:</label>
                    <textarea id="editHabitDescription" name="description"></textarea>
                </div>
                <div class="form-group">
                    <label for="editHabitColor">Color:</label>
                    <div class="color-picker">
                        <input type="color" id="editHabitColor" name="color">
                        <div class="color-presets">
                            <div class="color-preset" style="background: #FF6B6B" onclick="setEditColor('#FF6B6B')"></div>
                            <div class="color-preset" style="background: #4ECDC4" onclick="setEditColor('#4ECDC4')"></div>
                            <div class="color-preset" style="background: #45B7D1" onclick="setEditColor('#45B7D1')"></div>
                            <div class="color-preset" style="background: #96CEB4" onclick="setEditColor('#96CEB4')"></div>
                            <div class="color-preset" style="background: #FFEAA7" onclick="setEditColor('#FFEAA7')"></div>
                            <div class="color-preset" style="background: #DDA0DD" onclick="setEditColor('#DDA0DD')"></div>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn-primary">Update Habit</button>
            </form>
        </div>
    </div>

    <!-- Login Modal -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('loginModal')">&times;</span>
            <h2>Login to HabitZen</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label for="loginEmail">Email:</label>
                    <input type="email" id="loginEmail" name="email" required>
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password:</label>
                    <input type="password" id="loginPassword" name="password" required>
                </div>
                <button type="submit" class="btn-primary">Login</button>
                <p class="form-link">Don't have an account? <a href="#" onclick="switchModal('loginModal', 'registerModal')">Sign up</a></p>
            </form>
        </div>
    </div>

    <!-- Register Modal -->
    <div id="registerModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('registerModal')">&times;</span>
            <h2>Create Your Account</h2>
            <form id="registerForm">
                <div class="form-group">
                    <label for="registerUsername">Username:</label>
                    <input type="text" id="registerUsername" name="username" required>
                </div>
                <div class="form-group">
                    <label for="registerEmail">Email:</label>
                    <input type="email" id="registerEmail" name="email" required>
                </div>
                <div class="form-group">
                    <label for="registerPassword">Password:</label>
                    <input type="password" id="registerPassword" name="password" required>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password:</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required>
                </div>
                <button type="submit" class="btn-primary">Create Account</button>
                <p class="form-link">Already have an account? <a href="#" onclick="switchModal('registerModal', 'loginModal')">Login</a></p>
            </form>
        </div>
    </div>

    <script>
        // Pass PHP data to JavaScript
        const isLoggedIn = <?php echo isLoggedIn() ? 'true' : 'false'; ?>;
        const userHabits = <?php echo json_encode($habits); ?>;
    </script>
    <script src="js/auth.js"></script>
    <script src="js/habits.js"></script>
    <script src="js/main.js"></script>
</body>
</html>