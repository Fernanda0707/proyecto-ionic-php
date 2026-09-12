<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido"]);
    exit();
}

$host     = "localhost";
$db_name  = "app_database";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name};charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Fallo de conexión a la base de datos: " . $e->getMessage()]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Campos incompletos"]);
    exit();
}

$email    = trim($input['email']);
$password = trim($input['password']);

$stmt = $conn->prepare("SELECT id, name, email, password, role, is_active FROM users WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    if ((int)$user['is_active'] !== 1) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Cuenta inactiva"]);
        exit();
    }

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Inicio de sesión correcto",
        "user" => [
            "id" => (int)$user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "role" => $user['role']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Correo o contraseña incorrectos"]);
}