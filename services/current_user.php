<?php
// Devuelve info del usuario actual basada en la sesión PHP
if (session_status() == PHP_SESSION_NONE) session_start();
include('conn_bbdd.php');

if (!$link) {
  echo json_encode(["error" => "Conexión fallida"]);
  exit;
}

if (isset($_SESSION['user_id']) && intval($_SESSION['user_id'])>0) {
  $id = intval($_SESSION['user_id']);
} elseif (isset($_COOKIE['user_id']) && is_numeric($_COOKIE['user_id'])) {
  $id = intval($_COOKIE['user_id']);
} else {
  echo json_encode(["error" => "no_session"]);
  exit;
}

$sql = "SELECT id, user, name, email, tipo, abrev, puestos, equipos FROM usuarios WHERE id = {$id} LIMIT 1";
$res = mysqli_query($link, $sql);
if(!$res){ echo json_encode(["error"=> mysqli_error($link)]); exit; }
$row = mysqli_fetch_assoc($res);
if(!$row){ echo json_encode(["error"=>"not_found"]); exit; }

// si equipos es JSON, decodificarlo
if(isset($row['equipos']) && $row['equipos'] !== null && $row['equipos'] !== ''){
  $decoded = json_decode($row['equipos'], true);
  if(json_last_error() === JSON_ERROR_NONE) $row['equipos'] = $decoded;
}

echo json_encode(["resultados" => [ $row ]]);
mysqli_close($link);
exit;
?>