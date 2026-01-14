<?php

// Comprobar cookie de sesión 'user_id'
if (!isset($_COOKIE['user_id'])) {
  echo "KO: sesión ha expirado";
  exit;
}

$id = isset($_POST['id']) ? $_POST['id'] : '';
$user = isset($_POST['user']) ? $_POST['user'] : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$raw_password = $password; // conservar valor original para hashear antes de escapar
$name = isset($_POST['name']) ? $_POST['name'] : '';
$email = isset($_POST['email']) ? $_POST['email'] : '';
$extension = isset($_POST['extension']) ? $_POST['extension'] : '';
$pphone = isset($_POST['pphone']) ? $_POST['pphone'] : '';
$oficina = isset($_POST['oficina']) ? $_POST['oficina'] : '';
$puesto = isset($_POST['puesto']) ? $_POST['puesto'] : '';
$tipo = isset($_POST['tipo']) ? $_POST['tipo'] : '';
$abrev = isset($_POST['abrev']) ? $_POST['abrev'] : '';
$equipos = isset($_POST['equipos']) ? $_POST['equipos'] : '';

include("conn_bbdd.php");

// Verifica si la conexión es exitosa
if (!$link) {
    die("Conexión fallida: " . mysqli_connect_error());
}

// Escapar valores para seguridad
$user = mysqli_real_escape_string($link, $user);
$password = mysqli_real_escape_string($link, $password);
$name = mysqli_real_escape_string($link, $name);
$email = mysqli_real_escape_string($link, $email);
$extension = mysqli_real_escape_string($link, $extension);
$pphone = mysqli_real_escape_string($link, $pphone);
$oficina = mysqli_real_escape_string($link, $oficina);
$puesto = mysqli_real_escape_string($link, $puesto);
$tipo = mysqli_real_escape_string($link, $tipo);
$abrev = mysqli_real_escape_string($link, $abrev);
$equipos_raw = $equipos;
if(isset($equipos_raw) && trim($equipos_raw) !== ''){
  $decoded_equipos = json_decode($equipos_raw, true);
  if(json_last_error() !== JSON_ERROR_NONE){
    echo "KO: equipos JSON inválido";
    mysqli_close($link);
    exit;
  }
  // Normalizar JSON (mantener unicode)
  $equipos = json_encode($decoded_equipos, JSON_UNESCAPED_UNICODE);
} else {
  $equipos = '';
}
$equipos = mysqli_real_escape_string($link, $equipos);

// Preparar hash de contraseña solo si se recibió
$hasPassword = (isset($raw_password) && trim($raw_password) !== '');
if($hasPassword){
  $password_hashed = md5($raw_password);
  $password_hashed = mysqli_real_escape_string($link, $password_hashed);
}

// Para el CREATE, si no se envía password por defecto usar '1234' hasheado
if(!$hasPassword){
  $password_hashed = md5('1234');
  $password_hashed = mysqli_real_escape_string($link, $password_hashed);
}

// Si se proporciona un id no vacío, hacemos UPDATE, si no hacemos INSERT
if(isset($_POST['id']) && $_POST['id'] !== ''){
  $id = intval($_POST['id']);
  // Construir partes SET dinámicamente para no sobrescribir password si no se envía
  $setParts = array();
  $setParts[] = "`user`='{$user}'";
  if($hasPassword){
    $setParts[] = "`password`='{$password_hashed}'";
  }
  $setParts[] = "`name`='{$name}'";
  $setParts[] = "`email`='{$email}'";
  $setParts[] = "`extension`='{$extension}'";
  $setParts[] = "`pphone`='{$pphone}'";
  $setParts[] = "`oficina`='{$oficina}'";
  $setParts[] = "`puesto`='{$puesto}'";
  $setParts[] = "`tipo`='{$tipo}'";
  $setParts[] = "`abrev`='{$abrev}'";
  $setParts[] = "`equipos`='{$equipos}'";
  $sql = "UPDATE `usuarios` SET " . implode(', ', $setParts) . " WHERE `id`={$id}";

  if (mysqli_query($link, $sql)) {
      echo "OK";
  } else {
      echo "Error al actualizar el usuario: " . mysqli_error($link);
  }
} else {
  // Construir INSERT dinámico: incluir siempre password (si no se envió, usamos el por defecto '1234' hasheado)
  $cols = array('`user`','`password`');
  $vals = array("'{$user}'","'{$password_hashed}'");
  $cols = array_merge($cols, array('`name`','`email`','`extension`','`pphone`','`oficina`','`puesto`','`tipo`','`abrev`','`equipos`'));
  $vals = array_merge($vals, array("'{$name}'","'{$email}'","'{$extension}'","'{$pphone}'","'{$oficina}'","'{$puesto}'","'{$tipo}'","'{$abrev}'","'{$equipos}'"));
  $sql = "INSERT INTO `usuarios` (" . implode(',', $cols) . ") VALUES (" . implode(',', $vals) . ")";

  if (mysqli_query($link, $sql)) {
      echo "OK";
  } else {
      echo "Error al insertar nuevo usuario: " . mysqli_error($link);
  }
}

// Cierre de la conexión a la base de datos
mysqli_close($link);

?>
