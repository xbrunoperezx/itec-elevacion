<?php

// Comprobar cookie de sesión 'user_id'
if (!isset($_COOKIE['user_id'])) {
  echo "KO: sesión ha expirado";
  exit;
}

$id = isset($_POST['id']) ? $_POST['id'] : '';
$user = isset($_POST['user']) ? $_POST['user'] : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
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
$equipos = mysqli_real_escape_string($link, $equipos);

// Si se proporciona un id no vacío, hacemos UPDATE, si no hacemos INSERT
if(isset($_POST['id']) && $_POST['id'] !== ''){
  $id = intval($_POST['id']);
  $sql = "UPDATE `usuarios` SET `user`='{$user}', `password`='{$password}', `name`='{$name}', `email`='{$email}', `extension`='{$extension}', `pphone`='{$pphone}', `oficina`='{$oficina}', `puesto`='{$puesto}', `tipo`='{$tipo}', `abrev`='{$abrev}', `equipos`='{$equipos}' WHERE `id`={$id}";

  if (mysqli_query($link, $sql)) {
      echo "OK";
  } else {
      echo "Error al actualizar el usuario: " . mysqli_error($link);
  }
} else {
  $sql = "INSERT INTO `usuarios` (`user`,`password`,`name`,`email`,`extension`,`pphone`,`oficina`,`puesto`,`tipo`,`abrev`,`equipos`) VALUES ('{$user}','{$password}','{$name}','{$email}','{$extension}','{$pphone}','{$oficina}','{$puesto}','{$tipo}','{$abrev}','{$equipos}')";

  if (mysqli_query($link, $sql)) {
      echo "OK";
  } else {
      echo "Error al insertar nuevo usuario: " . mysqli_error($link);
  }
}

// Cierre de la conexión a la base de datos
mysqli_close($link);

?>
