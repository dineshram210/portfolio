<?php
// process.php

// Database connection
$host = 'localhost';
$db   = 'your_visitors';
$user = 'root';       // MySQL username
$pass = '';           // MySQL password
$charset = 'utf8';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    echo 'Database connection failed: ' . $e->getMessage();
    exit;
}

// Get POST data
$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

// Validate
if ($name === '' || $email === '' || $message === '') {
    echo 'Please fill all fields!';
    exit;
}
// Set timezone to Asia/Kolkata
date_default_timezone_set('Asia/Kolkata');

// Current date and time
$approach_date = date('Y-m-d');  // e.g., 2025-08-28
$approach_time = date('H:i:s');  // e.g., 15:32:45


// Insert query
$sql = "INSERT INTO myvisitors (name, email, message, approach_date, approach_time) VALUES (?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);

if ($stmt->execute([$name, $email, $message, $approach_date, $approach_time])) {
    echo 'Message sent successfully!';
} else {
    echo 'Failed to send message!';
}
?>
