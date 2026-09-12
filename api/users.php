<?php
// Configuración de CORS y cabeceras de respuesta
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Conexión a Base de Datos
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
    echo json_encode(["status" => "error", "message" => "Fallo de conexión: " . $e->getMessage()]);
    exit();
}

// Detección de método HTTP e ID por query string (?id=X)
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$input  = json_decode(file_get_contents("php://input"), true) ?? [];

switch ($method) {

    // PREFLIGHT CORS
    case 'OPTIONS':
        http_response_code(200);
        exit();

    // LEER USUARIOS (GET /api/users.php o /api/users.php?id=1)
    case 'GET':
        if ($id) {
            $stmt = $conn->prepare("SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $id]);
            $user = $stmt->fetch();

            if ($user) {
                http_response_code(200);
                echo json_encode(["status" => "success", "data" => $user]);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Usuario no encontrado"]);
            }
        } else {
            $stmt = $conn->query("SELECT id, name, email, role, is_active, created_at, updated_at FROM users ORDER BY id DESC");
            $users = $stmt->fetchAll();
            http_response_code(200);
            echo json_encode(["status" => "success", "count" => count($users), "data" => $users]);
        }
        break;

    // CREAR USUARIO (POST /api/users.php)
    case 'POST':
        if (empty($input['name']) || empty($input['email']) || empty($input['password'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Nombre, correo y contraseña son obligatorios"]);
            exit();
        }

        $email = trim($input['email']);
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "El correo electrónico ya se encuentra registrado"]);
            exit();
        }

        $name      = trim($input['name']);
        $password  = password_hash(trim($input['password']), PASSWORD_BCRYPT);
        $role      = isset($input['role']) && in_array($input['role'], ['admin', 'user']) ? $input['role'] : 'user';
        $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, is_active) VALUES (:name, :email, :password, :role, :is_active)");
        $stmt->execute([
            ':name'      => $name,
            ':email'     => $email,
            ':password'  => $password,
            ':role'      => $role,
            ':is_active' => $is_active
        ]);

        http_response_code(201);
        echo json_encode([
            "status"  => "success",
            "message" => "Usuario creado exitosamente",
            "id"      => (int)$conn->lastInsertId()
        ]);
        break;

    // ACTUALIZAR USUARIO COMPLETO (PUT /api/users.php?id=1)
    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Debe proporcionar el ID en la URL (?id=X)"]);
            exit();
        }

        if (empty($input['name']) || empty($input['email']) || !isset($input['role']) || !isset($input['is_active'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "PUT requiere todos los campos (name, email, role, is_active)"]);
            exit();
        }

        $email = trim($input['email']);
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email AND id != :id LIMIT 1");
        $stmt->execute([':email' => $email, ':id' => $id]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "El correo ya pertenece a otro usuario"]);
            exit();
        }

        $params = [
            ':id'        => $id,
            ':name'      => trim($input['name']),
            ':email'     => $email,
            ':role'      => in_array($input['role'], ['admin', 'user']) ? $input['role'] : 'user',
            ':is_active' => (int)$input['is_active']
        ];

        // Si se incluye contraseña, se actualiza también
        if (!empty($input['password'])) {
            $sql = "UPDATE users SET name = :name, email = :email, password = :password, role = :role, is_active = :is_active WHERE id = :id";
            $params[':password'] = password_hash(trim($input['password']), PASSWORD_BCRYPT);
        } else {
            $sql = "UPDATE users SET name = :name, email = :email, role = :role, is_active = :is_active WHERE id = :id";
        }

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Usuario actualizado correctamente"]);
        break;

    // ACTUALIZACIÓN PARCIAL (PATCH /api/users.php?id=1)
    case 'PATCH':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Debe proporcionar el ID en la URL (?id=X)"]);
            exit();
        }

        if (empty($input)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "No se enviaron datos para actualizar"]);
            exit();
        }

        $fields = [];
        $params = [':id' => $id];

        if (isset($input['name'])) {
            $fields[] = "name = :name";
            $params[':name'] = trim($input['name']);
        }
        if (isset($input['email'])) {
            $email = trim($input['email']);
            $stmtCheck = $conn->prepare("SELECT id FROM users WHERE email = :email AND id != :id LIMIT 1");
            $stmtCheck->execute([':email' => $email, ':id' => $id]);
            if ($stmtCheck->fetch()) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "El correo ya pertenece a otro usuario"]);
                exit();
            }
            $fields[] = "email = :email";
            $params[':email'] = $email;
        }
        if (!empty($input['password'])) {
            $fields[] = "password = :password";
            $params[':password'] = password_hash(trim($input['password']), PASSWORD_BCRYPT);
        }
        if (isset($input['role']) && in_array($input['role'], ['admin', 'user'])) {
            $fields[] = "role = :role";
            $params[':role'] = $input['role'];
        }
        if (isset($input['is_active'])) {
            $fields[] = "is_active = :is_active";
            $params[':is_active'] = (int)$input['is_active'];
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Campos inválidos"]);
            exit();
        }

        $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Campos actualizados correctamente con PATCH"]);
        break;

    // ELIMINAR USUARIO (DELETE /api/users.php?id=1)
    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Debe proporcionar el ID en la URL (?id=X)"]);
            exit();
        }

        $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Usuario eliminado"]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Usuario no encontrado"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Método no soportado"]);
        break;
}