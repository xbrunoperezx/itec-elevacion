<?php

// Comprobar cookie de sesion 'user_id'
if (!isset($_COOKIE['user_id'])) {
  echo json_encode(["error" => "KO: sesion ha expirado"]);
  exit;
}

include("conn_bbdd.php");

if (!$link) {
  die(json_encode(["error" => "Conexion fallida: " . mysqli_connect_error()]));
}

$action = isset($_POST['action']) ? $_POST['action'] : 'list';

switch($action) {
  case 'list':
    $lim = isset($_POST['filtro_total']) ? intval($_POST['filtro_total']) : 15;
    if ($lim <= 0) $lim = 15;
    $id = isset($_POST['filtro_id']) ? intval($_POST['filtro_id']) : 0;

    if ($id > 0) {
      $sql = "SELECT id, tarifa, precio FROM tarifas WHERE id=" . $id;
    } else {
      $sql = "SELECT id, tarifa, precio FROM tarifas";
      $where = array();

      if (!empty($_POST['filtro_tarifa'])) {
        $filtro = mysqli_real_escape_string($link, $_POST['filtro_tarifa']);
        $where[] = "tarifa LIKE '%" . $filtro . "%'";
      }

      if (count($where) > 0) {
        $sql .= " WHERE " . implode(" AND ", $where);
      }
      $sql .= " ORDER BY id ASC LIMIT 0," . $lim;
    }

    $result = mysqli_query($link, $sql);
    $rows = array();
    if ($result) {
      while ($row = mysqli_fetch_assoc($result)) {
        $rows[] = $row;
      }
    }

    echo json_encode(array('resultados' => $rows));
    break;

  case 'create':
    $tarifa  = isset($_POST['tarifa'])  ? mysqli_real_escape_string($link, trim($_POST['tarifa']))  : '';
    $precio  = isset($_POST['precio'])  ? intval($_POST['precio'])  : 0;

    if ($tarifa === '') {
      echo "Error: el campo tarifa es obligatorio";
      break;
    }

    $sql = "INSERT INTO `tarifas` (`tarifa`, `precio`) VALUES ('{$tarifa}', {$precio})";
    if (mysqli_query($link, $sql)) {
      echo "OK";
    } else {
      echo "Error al insertar tarifa: " . mysqli_error($link);
    }
    break;

  case 'update':
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($id === 0) {
      echo "Error: ID no proporcionado";
      break;
    }
    $tarifa  = isset($_POST['tarifa'])  ? mysqli_real_escape_string($link, trim($_POST['tarifa']))  : '';
    $precio  = isset($_POST['precio'])  ? intval($_POST['precio'])  : 0;

    $sql = "UPDATE `tarifas` SET `tarifa`='{$tarifa}', `precio`={$precio} WHERE `id`={$id}";
    if (mysqli_query($link, $sql)) {
      echo "OK";
    } else {
      echo "Error al actualizar tarifa: " . mysqli_error($link);
    }
    break;

  case 'delete':
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($id === 0) {
      echo "KO";
      break;
    }
    $sql = "DELETE FROM `tarifas` WHERE `id`={$id} LIMIT 1";
    if (mysqli_query($link, $sql)) {
      echo "OK";
    } else {
      echo "ERROR: " . mysqli_error($link);
    }
    break;

  default:
    echo json_encode(["error" => "Accion no valida"]);
    break;
}

mysqli_close($link);
?>
