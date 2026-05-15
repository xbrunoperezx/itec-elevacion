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
$acude = isset($_POST['acude']) ? trim($_POST['acude']) : '';
$grupo = isset($_POST['grupo']) ? trim($_POST['grupo']) : '';
$estado = isset($_POST['estado']) ? trim($_POST['estado']) : '';
$resultado = isset($_POST['resultado']) ? trim($_POST['resultado']) : '';
$proxima = isset($_POST['proxima']) ? trim($_POST['proxima']) : '';
$comunicada = isset($_POST['comunicada']) ? trim($_POST['comunicada']) : '';
$comunicada_aquien = isset($_POST['comunicada_aquien']) ? trim($_POST['comunicada_aquien']) : '';
$comunicada_como = isset($_POST['comunicada_como']) ? trim($_POST['comunicada_como']) : '';
$industria = isset($_POST['industria']) ? trim($_POST['industria']) : '';
$enviada_cliente = isset($_POST['enviada_cliente']) ? trim($_POST['enviada_cliente']) : '';
$observaciones = isset($_POST['observaciones']) ? trim($_POST['observaciones']) : '';
$observaciones_check = isset($_POST['observaciones_check']) ? trim($_POST['observaciones_check']) : '';

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
$acude_sql = "'" . mysqli_real_escape_string($link, $acude) . "'";
$grupo_sql = "NULL";

if ($grupo !== '') {
  if (preg_match('/^[0-9]+$/', $grupo)) {
    $grupo_id = intval($grupo);
    if ($grupo_id > 0) {
      $grupo_sql = (string)$grupo_id;
    }
  } else {
    $grupo_nombre = mysqli_real_escape_string($link, $grupo);
    $sql_grupo = "SELECT id FROM `grupos` WHERE `nombre` = '{$grupo_nombre}' LIMIT 1";
    $result_grupo = mysqli_query($link, $sql_grupo);
    if ($result_grupo && mysqli_num_rows($result_grupo) > 0) {
      $row_grupo = mysqli_fetch_assoc($result_grupo);
      $grupo_sql = (string)intval($row_grupo['id']);
    }
  }

  if ($grupo_sql === "NULL") {
    echo json_encode(array('error' => 'Grupo inválido. Selecciona un grupo existente.'));
    mysqli_close($link);
    exit;
  }
}

if ($fecha_db_sql === null) {
  echo json_encode(array('error' => 'La fecha de inspección es obligatoria'));
  mysqli_close($link);
  exit;
}


$proxima_sql = ($proxima !== '') ? "'" . mysqli_real_escape_string($link, $proxima) . "'" : "NULL";
$comunicada_sql = ($comunicada !== '') ? "'" . mysqli_real_escape_string($link, $comunicada) . "'" : "NULL";
$comunicada_aquien_sql = "'" . mysqli_real_escape_string($link, $comunicada_aquien) . "'";
$comunicada_como_sql = "'" . mysqli_real_escape_string($link, $comunicada_como) . "'";
$industria_sql = ($industria !== '') ? "'" . mysqli_real_escape_string($link, $industria) . "'" : "NULL";
$enviada_cliente_sql = ($enviada_cliente !== '') ? "'" . mysqli_real_escape_string($link, $enviada_cliente) . "'" : "NULL";
$estado_sql = ($estado !== '') ? intval($estado) : "NULL";
$resultado_sql = ($resultado !== '') ? intval($resultado) : "NULL";
$observaciones_sql = "'" . mysqli_real_escape_string($link, $observaciones) . "'";
$observaciones_check_sql = "'" . mysqli_real_escape_string($link, $observaciones_check) . "'";

$sql = "UPDATE `informes` SET
  `fecha` = {$fecha_db_sql},
  `hora_ini` = {$hora_ini_sql},
  `hora_fin` = {$hora_fin_sql},
  `gps_latitud` = {$gps_latitud_sql},
  `gps_longitud` = {$gps_longitud_sql},
  `acude` = {$acude_sql},
  `grupo` = {$grupo_sql},
  `estado` = {$estado_sql},
  `resultado` = {$resultado_sql},
  `proxima` = {$proxima_sql},
  `comunicada` = {$comunicada_sql},
  `comunicada_aquien` = {$comunicada_aquien_sql},
  `comunicada_como` = {$comunicada_como_sql},
  `industria` = {$industria_sql},
  `enviada_cliente` = {$enviada_cliente_sql},
  `observaciones` = {$observaciones_sql},
  `observaciones_check` = {$observaciones_check_sql}
  WHERE `id` = {$id}
  LIMIT 1";

if (mysqli_query($link, $sql)) {
  echo json_encode(array('success' => true, 'message' => 'Informe guardado correctamente'));
} else {
  echo json_encode(array('error' => 'Error al guardar informe: ' . mysqli_error($link), 'sql' => $sql));
}

mysqli_close($link);
?>
