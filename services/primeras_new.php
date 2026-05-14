<?php
session_start();
include_once("conn_bbdd.php");
header("Content-Type: application/json");

if (!isset($_COOKIE['user_id'])) {
  echo json_encode(array('error' => 'KO: sesión ha expirado'));
  exit;
}

$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$fecha_inspeccion = isset($_POST['fecha_inspeccion']) ? trim($_POST['fecha_inspeccion']) : '';
$hora_ini = isset($_POST['hora_ini']) ? trim($_POST['hora_ini']) : '';
$hora_fin = isset($_POST['hora_fin']) ? trim($_POST['hora_fin']) : '';
$gps_latitud = isset($_POST['gps_latitud']) ? trim($_POST['gps_latitud']) : '';
$gps_longitud = isset($_POST['gps_longitud']) ? trim($_POST['gps_longitud']) : '';
$grupo = isset($_POST['grupo']) ? trim($_POST['grupo']) : '';

if (!$link) {
  echo json_encode(array('error' => 'Conexión fallida: ' . mysqli_connect_error()));
  exit;
}

if ($id <= 0) {
  echo json_encode(array('error' => 'ID informe no proporcionado'));
  mysqli_close($link);
  exit;
}

$fecha_db = '';
if ($fecha_inspeccion !== '') {
  if (preg_match('/^[0-9]{2}-[0-9]{2}-[0-9]{4}$/', $fecha_inspeccion)) {
    $parts = explode('-', $fecha_inspeccion);
    $fecha_db = $parts[2] . '-' . $parts[1] . '-' . $parts[0];
  } else {
    $fecha_db = $fecha_inspeccion;
  }
}

$fecha_db_sql = ($fecha_db !== '') ? "'" . mysqli_real_escape_string($link, $fecha_db) . "'" : null;
$hora_ini_sql = "'" . mysqli_real_escape_string($link, $hora_ini) . "'";
$hora_fin_sql = "'" . mysqli_real_escape_string($link, $hora_fin) . "'";
$gps_latitud_sql = "'" . mysqli_real_escape_string($link, $gps_latitud) . "'";
$gps_longitud_sql = "'" . mysqli_real_escape_string($link, $gps_longitud) . "'";
$grupo_sql = intval($grupo);

if ($fecha_db_sql === null) {
  echo json_encode(array('error' => 'La fecha de inspección es obligatoria'));
  mysqli_close($link);
  exit;
}

$sql = "UPDATE `informes` SET
  `fecha` = {$fecha_db_sql},
  `hora_ini` = {$hora_ini_sql},
  `hora_fin` = {$hora_fin_sql},
  `gps_latitud` = {$gps_latitud_sql},
  `gps_longitud` = {$gps_longitud_sql},
  `grupo` = {$grupo_sql}
  WHERE `id` = {$id}
  LIMIT 1";

if (mysqli_query($link, $sql)) {
  echo json_encode(array('success' => true, 'message' => 'Informe guardado correctamente'));
} else {
  echo json_encode(array('error' => 'Error al guardar informe: ' . mysqli_error($link), 'sql' => $sql));
}

mysqli_close($link);
?>
