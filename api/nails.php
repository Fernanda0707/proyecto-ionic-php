<?php
declare(strict_types=1);
require __DIR__.'/config.php';
$method=$_SERVER['REQUEST_METHOD'];
$action=$_GET['resource'] ?? '';
$id=filter_input(INPUT_GET,'id',FILTER_VALIDATE_INT);
try {
  if ($action==='register') {
    mustMethod($method,['POST']);
    $d=input(); $name=trim((string)($d['name']??'')); $email=strtolower(trim((string)($d['email']??'')));
    $password=(string)($d['password']??''); $phone=trim((string)($d['phone']??''));
    if (mb_strlen($name)<2 || !filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($password)<8 || mb_strlen($phone)>25) fail(422,'Nombre, email válido y contraseña de 8+ caracteres obligatorios');
    $s=$pdo->prepare("INSERT INTO users(name,email,password,phone,role) VALUES(?,?,?,?, 'client')");
    try { $s->execute([$name,$email,password_hash($password,PASSWORD_DEFAULT),$phone]); }
    catch(PDOException $e) { if ($e->getCode()==='23000') fail(409,'Correo ya registrado'); throw $e; }
    ok(['id'=>(int)$pdo->lastInsertId(),'message'=>'Registro exitoso'],201);
  }
  if ($action==='login') {
    mustMethod($method,['POST']); $d=input();
    $s=$pdo->prepare('SELECT * FROM users WHERE email=? AND is_active=1');
    $s->execute([strtolower(trim((string)($d['email']??'')))]);
    $u=$s->fetch();
    if (!$u || !password_verify((string)($d['password']??''),$u['password'])) fail(401,'Credenciales incorrectas');
    $token=bin2hex(random_bytes(32));
    $s=$pdo->prepare('INSERT INTO auth_tokens(user_id,token_hash,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 7 DAY))');
    $s->execute([$u['id'],hash('sha256',$token)]);
    ok(['token'=>$token,'user'=>['id'=>(int)$u['id'],'name'=>$u['name'],'email'=>$u['email'],'phone'=>$u['phone'],'role'=>$u['role']]]);
  }
  if ($action==='services') {
    mustMethod($method,['GET']);
    $s=$pdo->query('SELECT id,name,description,price,duration_minutes FROM services WHERE is_active=1 ORDER BY price');
    ok($s->fetchAll());
  }
  $user=bearer($pdo);
  if ($action==='logout') {
    mustMethod($method,['POST']);
    $header=$_SERVER['HTTP_AUTHORIZATION']??'';
    $token=substr($header,7);
    $pdo->prepare('DELETE FROM auth_tokens WHERE token_hash=?')->execute([hash('sha256',$token)]);
    ok(['message'=>'Sesión cerrada']);
  }
  if ($action==='profile') {
    mustMethod($method,['GET','PATCH']);
    if ($method==='GET') ok($user);
    $d=input(); $name=trim((string)($d['name']??'')); $phone=trim((string)($d['phone']??''));
    if (mb_strlen($name)<2 || mb_strlen($phone)>25) fail(422,'Datos inválidos');
    $pdo->prepare('UPDATE users SET name=?,phone=? WHERE id=?')->execute([$name,$phone,$user['id']]);
    ok(['message'=>'Perfil actualizado']);
  }
  if ($action==='appointments') {
    mustMethod($method,['GET','POST','PUT','PATCH','DELETE']);
    if ($method==='GET') {
      $s=$pdo->prepare('SELECT a.id,a.service_id,s.name AS service_name,a.start_at,a.status,a.notes,s.price,s.duration_minutes FROM appointments a JOIN services s ON s.id=a.service_id WHERE a.user_id=? ORDER BY a.start_at DESC');
      $s->execute([$user['id']]); ok($s->fetchAll());
    }
    if ($method==='DELETE') {
      if (!$id || $id<1) fail(400,'ID requerido');
      $s=$pdo->prepare("UPDATE appointments SET status='cancelled' WHERE id=? AND user_id=? AND status='scheduled' AND start_at>NOW()");
      $s->execute([$id,$user['id']]);
      if (!$s->rowCount()) fail(404,'Cita no encontrada o no cancelable');
      ok(['message'=>'Cita cancelada']);
    }
    $d=input();
    if ($method==='PATCH' && isset($d['notes']) && count($d)===1) {
      if (!$id) fail(400,'ID requerido');
      $notes=trim((string)$d['notes']);
      if (mb_strlen($notes)>500) fail(422,'Notas demasiado largas');
      $s=$pdo->prepare("UPDATE appointments SET notes=? WHERE id=? AND user_id=? AND status='scheduled' AND start_at>NOW()");
      $s->execute([$notes,$id,$user['id']]);
      if (!$s->rowCount()) fail(404,'No se pudo modificar la cita');
      ok(['message'=>'Notas actualizadas']);
    }
    if ($method==='PUT' || $method==='PATCH') {
      if (!$id) fail(400,'ID requerido');
      $s=$pdo->prepare("SELECT id FROM appointments WHERE id=? AND user_id=? AND status='scheduled' AND start_at>NOW()");
      $s->execute([$id,$user['id']]);
      if (!$s->fetch()) fail(404,'Cita no encontrada o no editable');
    }
    $sid=filter_var($d['service_id']??null,FILTER_VALIDATE_INT);
    $time=(string)($d['start_at']??'');
    $date=DateTimeImmutable::createFromFormat('!Y-m-d H:i:s',$time);
    if (!$sid || !$date || $date->format('Y-m-d H:i:s')!==$time || $date<=new DateTimeImmutable('now') || (int)$date->format('i')%30!==0 || (int)$date->format('s')!==0) fail(422,'Servicio y fecha futura válida (bloques de 30 minutos) requeridos');
    $hour=(int)$date->format('G');
    if ($hour<9 || $hour>=19) fail(422,'Horario disponible de 09:00 a 19:00');
    $s=$pdo->prepare('SELECT duration_minutes FROM services WHERE id=? AND is_active=1');
    $s->execute([$sid]); $duration=$s->fetchColumn();
    if (!$duration) fail(404,'Servicio no disponible');
    $end=$date->modify('+'.(int)$duration.' minutes');
    if ($end->format('Y-m-d')!==$date->format('Y-m-d') || (int)$end->format('G')>19 || ((int)$end->format('G')===19 && (int)$end->format('i')>0)) fail(422,'La cita termina fuera del horario');
    $notes=trim((string)($d['notes']??''));
    if (mb_strlen($notes)>500) fail(422,'Notas demasiado largas');
    // Single stylist: serialize the entire availability check and write across concurrent requests.
    $lock='nail_'. $date->format('Ymd');
    $lockStmt=$pdo->prepare('SELECT GET_LOCK(?,10)');
    $lockStmt->execute([$lock]);
    if ((int)$lockStmt->fetchColumn()!==1) fail(503,'No se pudo reservar el horario; intenta de nuevo');
    try {
      $s=$pdo->prepare("SELECT COUNT(*) FROM appointments a JOIN services sv ON sv.id=a.service_id WHERE a.status='scheduled' AND a.start_at < ? AND DATE_ADD(a.start_at,INTERVAL sv.duration_minutes MINUTE) > ? AND a.id <> ?");
      $s->execute([$end->format('Y-m-d H:i:s'),$time,$id ?: 0]);
      if ((int)$s->fetchColumn()>0) fail(409,'Horario ocupado; selecciona otro');
      if ($method==='POST') {
        $s=$pdo->prepare("INSERT INTO appointments(user_id,service_id,start_at,status,notes) VALUES(?,?,?,'scheduled',?)");
        $s->execute([$user['id'],$sid,$time,$notes]);
        ok(['id'=>(int)$pdo->lastInsertId(),'message'=>'Cita agendada'],201);
      }
      $s=$pdo->prepare('UPDATE appointments SET service_id=?,start_at=?,notes=? WHERE id=? AND user_id=?');
      $s->execute([$sid,$time,$notes,$id,$user['id']]);
      ok(['message'=>'Cita reprogramada']);
    } finally {
      $pdo->prepare('SELECT RELEASE_LOCK(?)')->execute([$lock]);
    }
  }
  fail(404,'Recurso inexistente');
} catch(Throwable $e) {
  error_log($e->getMessage());
  fail(500,'Ocurrió un error en el servidor');
}
