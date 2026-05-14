<?php
session_start();
include_once("conn_bbdd.php");
header("Content-Type: application/json");

if (!isset($_COOKIE['user_id'])) {
  echo json_encode(array('error' => 'KO: sesión ha expirado'));
  exit;
}

$action = isset($_POST['action']) ? $_POST['action'] : '';
$id_informe = isset($_POST['id_informe']) ? intval($_POST['id_informe']) : 0;
$equipos_json = isset($_POST['equipos_json']) ? $_POST['equipos_json'] : '';

if (!$link) {
  echo json_encode(array('error' => 'Conexión fallida: ' . mysqli_connect_error()));
  exit;
}

switch ($action) {
  case 'get':
    if ($id_informe === 0) {
      echo json_encode(array('error' => 'ID informe no proporcionado'));
      break;
    }

    $sql = "SELECT * FROM `informes_equipos` WHERE `id_informe` = {$id_informe} ORDER BY `id` DESC LIMIT 1";
    $result = mysqli_query($link, $sql);

    if ($result && mysqli_num_rows($result) > 0) {
      $row = mysqli_fetch_assoc($result);
      $equipos = array();
      if (isset($row['equipos']) && $row['equipos'] !== '') {
        $equipos = json_decode($row['equipos'], true);
        if (!is_array($equipos)) {
          $equipos = array();
        }
      }
      echo json_encode(array(
        'id' => $row['id'],
        'id_informe' => $row['id_informe'],
        'equipos' => $equipos
      ));
    } else {
      echo json_encode(array(
        'id' => null,
        'id_informe' => $id_informe,
        'equipos' => array()
      ));
    }
    break;

  case 'save':
    if ($id_informe === 0) {
      echo json_encode(array('error' => 'ID informe no proporcionado'));
      break;
    }

    $equipos_array = array();
    if (!empty($equipos_json)) {
      $equipos_array = is_string($equipos_json) ? json_decode($equipos_json, true) : $equipos_json;
      if (!is_array($equipos_array)) {
        echo json_encode(array('error' => 'Formato JSON inválido en equipos'));
        break;
      }
    }

    $equipos_json_str = json_encode($equipos_array, JSON_UNESCAPED_UNICODE);
    $equipos_json_escaped = mysqli_real_escape_string($link, $equipos_json_str);

    $sql_check = "SELECT `id` FROM `informes_equipos` WHERE `id_informe` = {$id_informe} ORDER BY `id` DESC LIMIT 1";
    $result_check = mysqli_query($link, $sql_check);

    if ($result_check && mysqli_num_rows($result_check) > 0) {
      $sql = "UPDATE `informes_equipos` SET `equipos` = '{$equipos_json_escaped}' WHERE `id_informe` = {$id_informe}";
    } else {
      $sql = "INSERT INTO `informes_equipos` (`id_informe`, `equipos`) VALUES ({$id_informe}, '{$equipos_json_escaped}')";
    }

    if (mysqli_query($link, $sql)) {
      echo json_encode(array('success' => true, 'message' => 'Equipos guardados correctamente'));
    } else {
      echo json_encode(array('error' => 'Error al guardar equipos: ' . mysqli_error($link)));
    }
    break;

  default:
    echo json_encode(array('error' => 'Acción no válida'));
    break;
}

mysqli_close($link);
?>
