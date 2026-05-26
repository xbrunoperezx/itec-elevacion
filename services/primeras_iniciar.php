<?php
session_start();
include_once("conn_bbdd.php");
header("Content-Type: application/json");

if (!isset($_COOKIE['user_id'])) {
  echo json_encode(array('error' => 'KO: sesión ha expirado'));
  exit;
}

$id       = isset($_POST['id_informe']) ? intval($_POST['id_informe']) : 0;
$hora_ini = isset($_POST['hora_ini'])   ? trim($_POST['hora_ini'])     : '';

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
$sql = "UPDATE `primeras` SET `hora_ini` = '{$hora_ini_safe}' WHERE `id` = {$id} AND (`hora_ini` IS NULL OR `hora_ini` = '')";
if (!mysqli_query($link, $sql)) {
  echo json_encode(array('error' => 'Error al guardar: ' . mysqli_error($link)));
  mysqli_close($link);
  exit;
}

echo json_encode(array('ok' => true, 'hora_ini' => $hora_ini));
mysqli_close($link);
