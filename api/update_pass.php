<?php
$host     = "localhost";
$db_name  = "app_database";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name};charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $hash = password_hash("Admin123!", PASSWORD_BCRYPT);

    $stmt = $conn->prepare("UPDATE users SET password = :pass, is_active = 1 WHERE email = 'admin@example.com'");
    $stmt->execute([':pass' => $hash]);

    echo "Contraseña actualizada correctamente a: Admin123!";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}