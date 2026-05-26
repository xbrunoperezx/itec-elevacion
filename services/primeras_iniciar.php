<?php
session_start();
include_once("conn_bbdd.php");
header("Content-Type: application/json");

if (!isset($_COOKIE['user_id'])) {
  echo json_encode(array('error' => 'KO: sesión ha expirado'));
  exit;
}

$id        = isset($_POST['id_informe']) ? intval($_POST['id_informe']) : 0;
$hora_ini  = isset($_POST['hora_ini'])   ? trim($_POST['hora_ini'])     : '';
$gps_lat   = isset($_POST['gps_latitud']) ? trim($_POST['gps_latitud']) : '';
$gps_long  = isset($_POST['gps_longitud']) ? trim($_POST['gps_longitud']) : '';

if ($id <= 0) {
  echo json_encode(array('error' => 'ID informe no proporcionado'));
  exit;
}

if (!preg_match('/^[0-2][0-9]:[0-5][0-9]$/', $hora_ini)) {
  echo json_encode(array('error' => 'Formato de hora inválido'));
  exit;
}

if (!$link) {
  echo json_encode(array('error' => 'Conexión fallida'));
  exit;
}

$hora_ini_safe = mysqli_real_escape_string($link, $hora_ini);
$updates = array("`hora_ini` = '{$hora_ini_safe}'");

if ($gps_lat !== '') {
  $gps_lat_safe = mysqli_real_escape_string($link, $gps_lat);
  $updates[] = "`gps_latitud` = '{$gps_lat_safe}'";
}

if ($gps_long !== '') {
  $gps_long_safe = mysqli_real_escape_string($link, $gps_long);
  $updates[] = "`gps_longitud` = '{$gps_long_safe}'";
}

$sql = "UPDATE `informes` SET " . implode(', ', $updates) . " WHERE `id` = {$id}";
if (!mysqli_query($link, $sql)) {
  echo json_encode(array('error' => 'Error al guardar: ' . mysqli_error($link)));
  mysqli_close($link);
  exit;
}

echo json_encode(array('ok' => true, 'hora_ini' => $hora_ini, 'gps_latitud' => $gps_lat, 'gps_longitud' => $gps_long));
mysqli_close($link);
