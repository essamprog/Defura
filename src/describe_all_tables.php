<?php
require_once 'c:/xampp/htdocs/LMS-React/backend/bootstrap.php';
use EDUManage\Config\Database;

try {
    $pdo = Database::getConnection();
    
    foreach (['courses', 'course_lessons', 'course_sections'] as $t) {
        echo "\n--- $t ---\n";
        $q = $pdo->query("DESCRIBE $t");
        while ($row = $q->fetch(PDO::FETCH_ASSOC)) {
            echo "  {$row['Field']} - {$row['Type']}\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
