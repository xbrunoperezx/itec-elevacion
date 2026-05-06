<?php

if (!isset($_COOKIE['user_id'])) {
  echo json_encode(["error" => "KO: sesion ha expirado"]);
  exit;
}

include("conn_bbdd.php");

if (!$link) {
  die(json_encode(["error" => "Conexion fallida: " . mysqli_connect_error()]));
}

$LEGISLACIONES_VALIDAS = [
  'RAE 1966',
  'RD 2291/1985 (ITC-MIE-AEM1)',
  'R.D. 1314/1997',
  'R.D. 203/2016'
];

$action = isset($_POST['action']) ? $_POST['action'] : 'list';

switch($action) {
  case 'list':
    $lim = isset($_POST['filtro_total']) ? intval($_POST['filtro_total']) : 15;
    if ($lim <= 0) $lim = 15;
    $id = isset($_POST['filtro_id']) ? intval($_POST['filtro_id']) : 0;

    if ($id > 0) {
      $sql = "SELECT id, nombre, abrev, activa, legislacion FROM legislacion WHERE id=" . $id;
    } else {
      $sql = "SELECT id, nombre, abrev, activa, legislacion FROM legislacion";
      $where = array();

      if (!empty($_POST['filtro_nombre'])) {
        $filtro = mysqli_real_escape_string($link, $_POST['filtro_nombre']);
        $where[] = "nombre LIKE '%" . $filtro . "%'";
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
    $nombre = isset($_POST['nombre']) ? mysqli_real_escape_string($link, trim($_POST['nombre'])) : '';
    $legislacion = isset($_POST['legislacion']) ? mysqli_real_escape_string($link, trim($_POST['legislacion'])) : '';
    $abrev  = isset($_POST['abrev'])  ? mysqli_real_escape_string($link, trim($_POST['abrev']))  : '';
    $activa = isset($_POST['activa']) ? intval($_POST['activa']) : 1;

    if ($nombre === '' || $abrev === '' || $legislacion === '') {
      echo "Error: nombre, legislacion y abreviatura son obligatorios";
      break;
    }
    if (!in_array($legislacion, $LEGISLACIONES_VALIDAS)) {
      echo "Error: legislacion no valida";
      break;
    }

    $sql = "INSERT INTO `legislacion` (`nombre`, `abrev`, `activa`, `legislacion`) VALUES ('{$nombre}', '{$abrev}', {$activa}, '{$legislacion}')";
    if (mysqli_query($link, $sql)) {
      echo "OK";
    } else {
      echo "Error al insertar legislacion: " . mysqli_error($link);
    }
    break;

  case 'update':
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($id === 0) {
      echo "Error: ID no proporcionado";
      break;
    }

    $nombre = isset($_POST['nombre']) ? mysqli_real_escape_string($link, trim($_POST['nombre'])) : '';
    $legislacion = isset($_POST['legislacion']) ? mysqli_real_escape_string($link, trim($_POST['legislacion'])) : '';
    $abrev  = isset($_POST['abrev'])  ? mysqli_real_escape_string($link, trim($_POST['abrev']))  : '';
    $activa = isset($_POST['activa']) ? intval($_POST['activa']) : 1;

    if ($nombre === '' || $abrev === '' || $legislacion === '') {
      echo "Error: nombre, legislacion y abreviatura son obligatorios";
      break;
    }
    if (!in_array($legislacion, $LEGISLACIONES_VALIDAS)) {
      echo "Error: legislacion no valida";
      break;
    }

    $sql = "UPDATE `legislacion` SET `nombre`='{$nombre}', `abrev`='{$abrev}', `activa`={$activa}, `legislacion`='{$legislacion}' WHERE `id`={$id}";
    if (mysqli_query($link, $sql)) {
      echo "OK";
    } else {
      echo "Error al actualizar legislacion: " . mysqli_error($link);
    }
    break;

  case 'delete':
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($id === 0) {
      echo "KO";
      break;
    }

    $sql = "DELETE FROM `legislacion` WHERE `id`={$id} LIMIT 1";
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
