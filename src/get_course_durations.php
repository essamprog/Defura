<?php
require_once 'c:/xampp/htdocs/LMS-React/backend/bootstrap.php';
use EDUManage\Config\Database;

try {
    $pdo = Database::getConnection();
    
    echo "--- All Courses Durations ---\n";
    $q = $pdo->query("SELECT id, title, total_duration FROM courses");
    while ($course = $q->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: {$course['id']}, Title: {$course['title']}, total_duration: {$course['total_duration']}\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
