<?php

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
      $sql = "SELECT id, version, texto, date, visible FROM historial_versiones WHERE id=" . $id;
    } else {
      $sql = "SELECT id, version, texto, date, visible FROM historial_versiones";
      $where = array();

      if (!empty($_POST['filtro_version'])) {
        $filtro = mysqli_real_escape_string($link, $_POST['filtro_version']);
        $where[] = "version LIKE '%" . $filtro . "%'";
      }

      if (count($where) > 0) {
        $sql .= " WHERE " . implode(" AND ", $where);
      }
      $sql .= " ORDER BY id DESC LIMIT 0," . $lim;
    }

    $result = mysqli_query($link, $sql);
    $rows = array();
    if ($result) {
      while ($row = mysqli_fetch_assoc($result)) {
        if ($row['date'] && $row['date'] != '0000-00-00') {
          $row['date_dmy'] = date("d-m-Y", strtotime($row['date']));
        } else {
          $row['date_dmy'] = '-';
        }
        $rows[] = $row;
      }
    }
    echo json_encode(array('resultados' => $rows));
    break;

  case 'create':
    $version = isset($_POST['version']) ? mysqli_real_escape_string($link, trim($_POST['version'])) : '';
    $texto   = isset($_POST['texto'])   ? mysqli_real_escape_string($link, trim($_POST['texto']))   : '';
    $date    = (!empty($_POST['date'])) ? mysqli_real_escape_string($link, $_POST['date']) : date('Y-m-d');

    if ($version === '') {
      echo "Error: el campo version es obligatorio";
      break;
    }

    $visible = isset($_POST['visible']) ? intval($_POST['visible']) : 0;
    $visible = ($visible === 1) ? 1 : 0;

    $sql = "INSERT INTO `historial_versiones` (`version`, `texto`, `date`, `visible`) VALUES ('{$version}', '{$texto}', '{$date}', {$visible})";
    if (mysqli_query($link, $sql)) {
      echo "OK";
    } else {
      echo "Error al insertar historial: " . mysqli_error($link);
    }
    break;

  case 'update':
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($id === 0) {
      echo "Error: ID no proporcionado";
      break;
    }
    $version = isset($_POST['version']) ? mysqli_real_escape_string($link, trim($_POST['version'])) : '';
    $texto   = isset($_POST['texto'])   ? mysqli_real_escape_string($link, trim($_POST['texto']))   : '';
    $date    = (!empty($_POST['date'])) ? mysqli_real_escape_string($link, $_POST['date']) : date('Y-m-d');

    $visible = isset($_POST['visible']) ? intval($_POST['visible']) : 0;
    $visible = ($visible === 1) ? 1 : 0;

    $sql = "UPDATE `historial_versiones` SET `version`='{$version}', `texto`='{$texto}', `date`='{$date}', `visible`={$visible} WHERE `id`={$id}";
    if (mysqli_query($link, $sql)) {
      echo "OK";
    } else {
      echo "Error al actualizar historial: " . mysqli_error($link);
    }
    break;

  case 'delete':
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($id === 0) {
      echo "KO";
      break;
    }
    $sql = "DELETE FROM `historial_versiones` WHERE `id`={$id} LIMIT 1";
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