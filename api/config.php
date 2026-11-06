<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
$allowed = array_filter(array_map('trim', explode(',', getenv('CORS_ORIGINS') ?: 'http://localhost:8100,http://localhost:4200')));
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed, true)) { header('Access-Control-Allow-Origin: '.$origin); header('Vary: Origin'); }
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
function fail(int $status, string $message): never { http_response_code($status); echo json_encode(['status'=>'error','message'=>$message]); exit; }
function ok($data, int $status=200): never { http_response_code($status); echo json_encode(['status'=>'success','data'=>$data], JSON_UNESCAPED_UNICODE); exit; }
function input(): array {
    $raw = file_get_contents('php://input');
    $value = json_decode($raw ?: '{}', true);
    if (!is_array($value) || json_last_error() !== JSON_ERROR_NONE) fail(400,'JSON inválido');
    return $value;
}
try {
    $pdo = new PDO('mysql:host='.(getenv('DB_HOST') ?: '127.0.0.1').';dbname='.(getenv('DB_NAME') ?: 'nail_salon').';charset=utf8mb4', getenv('DB_USER') ?: 'root', getenv('DB_PASSWORD') ?: '', [
       PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,
       PDO::ATTR_EMULATE_PREPARES=>false
    ]);
} catch (Throwable $e) { error_log($e->getMessage()); fail(503,'Base de datos no disponible'); }
function bearer(PDO $pdo): array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer ([a-f0-9]{64})$/i', $header, $m)) fail(401,'Inicia sesión');
    $stmt=$pdo->prepare('SELECT u.id,u.name,u.email,u.phone,u.role FROM auth_tokens t JOIN users u ON u.id=t.user_id WHERE t.token_hash=? AND t.expires_at>NOW() AND u.is_active=1');
    $stmt->execute([hash('sha256',$m[1])]);
    return $stmt->fetch() ?: fail(401,'Sesión vencida');
}
function mustMethod(string $method, array $allowed): void {
    if (!in_array($method,$allowed,true)) { header('Allow: '.implode(', ',$allowed)); fail(405,'Método no permitido'); }
}
