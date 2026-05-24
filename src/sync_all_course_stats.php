<?php
require_once 'c:/xampp/htdocs/LMS-React/backend/bootstrap.php';
use EDUManage\Config\Database;

try {
    $pdo = Database::getConnection();
    
    $coursesQ = $pdo->query("SELECT id FROM courses");
    $courses = $coursesQ->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Syncing courses:\n";
    foreach ($courses as $courseId) {
        // Count published lessons
        $cntStmt = $pdo->prepare("
            SELECT COUNT(*) 
            FROM   course_lessons cl
            JOIN   course_sections cs ON cl.section_id = cs.id
            WHERE  cs.course_id = :course_id AND cl.deleted_at IS NULL AND cl.status = 'published'
        ");
        $cntStmt->execute([':course_id' => $courseId]);
        $totalLessons = (int) $cntStmt->fetchColumn();
        
        // Sum published duration_minutes
        $durStmt = $pdo->prepare("
            SELECT SUM(cl.duration_minutes) 
            FROM   course_lessons cl
            JOIN   course_sections cs ON cl.section_id = cs.id
            WHERE  cs.course_id = :course_id AND cl.deleted_at IS NULL AND cl.status = 'published'
        ");
        $durStmt->execute([':course_id' => $courseId]);
        $totalDuration = (int) $durStmt->fetchColumn();
        
        // Update courses table
        $updStmt = $pdo->prepare("
            UPDATE courses 
            SET    total_lessons = :lessons, total_duration = :duration
            WHERE  id = :id
        ");
        $updStmt->execute([
            ':lessons' => $totalLessons,
            ':duration' => $totalDuration,
            ':id' => $courseId
        ]);
        
        echo "Course ID: $courseId - Lessons: $totalLessons, Duration (min): $totalDuration\n";
    }
    echo "All courses synced successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
