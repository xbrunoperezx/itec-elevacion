<?php

// Comprobar cookie de sesión 'user_id'
if (!isset($_COOKIE['user_id'])) {
  echo "KO: sesión ha expirado";
  exit;
}

$id = isset($_POST['id']) ? $_POST['id'] : '';
$codigo = isset($_POST['codigo']) ? $_POST['codigo'] : '';
$nombre = isset($_POST['nombre']) ? $_POST['nombre'] : '';
$marca = isset($_POST['marca']) ? $_POST['marca'] : '';
$modelo = isset($_POST['modelo']) ? $_POST['modelo'] : '';
$num_serie = isset($_POST['num_serie']) ? $_POST['num_serie'] : '';
$forma_calibracion = isset($_POST['forma_calibracion']) ? $_POST['forma_calibracion'] : '';
$procedimiento = isset($_POST['procedimiento']) ? $_POST['procedimiento'] : '';
$periodo = isset($_POST['periodo']) ? $_POST['periodo'] : '';
$ultima_calibracion = isset($_POST['ultima_calibracion']) ? $_POST['ultima_calibracion'] : '';
$prox_calibracion = isset($_POST['prox_calibracion']) ? $_POST['prox_calibracion'] : '';

include("conn_bbdd.php");

// Verifica si la conexión es exitosa
if (!$link) {
    die("Conexión fallida: " . mysqli_connect_error());
}

// Escapar valores para seguridad
$codigo = mysqli_real_escape_string($link, $codigo);
$nombre = mysqli_real_escape_string($link, $nombre);
$marca = mysqli_real_escape_string($link, $marca);
$modelo = mysqli_real_escape_string($link, $modelo);
$num_serie = mysqli_real_escape_string($link, $num_serie);
$forma_calibracion = mysqli_real_escape_string($link, $forma_calibracion);
$procedimiento = mysqli_real_escape_string($link, $procedimiento);
$periodo = mysqli_real_escape_string($link, $periodo);

// Manejo de fechas: si están vacías almacenar NULL
$ultima_is_null = false;
if(isset($ultima_calibracion) && trim($ultima_calibracion) !== ''){
  $ultima_calibracion = mysqli_real_escape_string($link, $ultima_calibracion);
  $ultima_is_null = false;
} else {
  $ultima_calibracion = null;
  $ultima_is_null = true;
}

$prox_is_null = false;
if(isset($prox_calibracion) && trim($prox_calibracion) !== ''){
  $prox_calibracion = mysqli_real_escape_string($link, $prox_calibracion);
  $prox_is_null = false;
} else {
  $prox_calibracion = null;
  $prox_is_null = true;
}

// Si se proporciona un id no vacío, hacemos UPDATE, si no hacemos INSERT
if(isset($_POST['id']) && $_POST['id'] !== ''){
  $id = intval($_POST['id']);
  $setParts = array();
  $setParts[] = "`codigo`='{$codigo}'";
  $setParts[] = "`nombre`='{$nombre}'";
  $setParts[] = "`marca`='{$marca}'";
  $setParts[] = "`modelo`='{$modelo}'";
  $setParts[] = "`num_serie`='{$num_serie}'";
  $setParts[] = "`forma_calibracion`='{$forma_calibracion}'";
  $setParts[] = "`procedimiento`='{$procedimiento}'";
  $setParts[] = "`periodo`='{$periodo}'";
  if($ultima_is_null){
    $setParts[] = "`ultima_calibracion`=NULL";
  } else {
    $setParts[] = "`ultima_calibracion`='{$ultima_calibracion}'";
  }
  if($prox_is_null){
    $setParts[] = "`prox_calibracion`=NULL";
  } else {
    $setParts[] = "`prox_calibracion`='{$prox_calibracion}'";
  }

  $sql = "UPDATE `equipos` SET " . implode(', ', $setParts) . " WHERE `id`={$id}";

  if (mysqli_query($link, $sql)) {
      echo "OK";
  } else {
      echo "Error al actualizar el equipo: " . mysqli_error($link);
  }
} else {
  // INSERT
  $cols = array('`codigo`','`nombre`','`marca`','`modelo`','`num_serie`','`forma_calibracion`','`procedimiento`','`periodo`','`ultima_calibracion`','`prox_calibracion`');
  $vals = array("'{$codigo}'","'{$nombre}'","'{$marca}'","'{$modelo}'","'{$num_serie}'","'{$forma_calibracion}'","'{$procedimiento}'","'{$periodo}'");
  if($ultima_is_null){
    $vals[] = "NULL";
  } else {
    $vals[] = "'{$ultima_calibracion}'";
  }
  if($prox_is_null){
    $vals[] = "NULL";
  } else {
    $vals[] = "'{$prox_calibracion}'";
  }

  $sql = "INSERT INTO `equipos` (" . implode(',', $cols) . ") VALUES (" . implode(',', $vals) . ")";

  if (mysqli_query($link, $sql)) {
      echo "OK";
  } else {
      echo "Error al insertar nuevo equipo: " . mysqli_error($link);
  }
}

mysqli_close($link);

?>
