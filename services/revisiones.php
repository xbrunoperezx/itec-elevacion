<?php

if (!isset($_COOKIE['user_id'])) {
  echo json_encode(["error" => "KO: sesion ha expirado"]);
  exit;
}

include("conn_bbdd.php");

if (!$link) {
  die(json_encode(["error" => "Conexion fallida: " . mysqli_connect_error()]));
}

$DOMINIOS_VALIDOS = [
  'INFORME MEDIDAS',
  'INFORME CARACTERISTICAS',
  'CHECKLIST',
  'INFORME ACTA',
  'INFORME HOJA DE CAMPO'
];

$action = isset($_POST['action']) ? $_POST['action'] : 'list';

switch($action) {
  case 'list':
    $lim = isset($_POST['filtro_total']) ? intval($_POST['filtro_total']) : 15;
    if ($lim <= 0) $lim = 15;
    $id = isset($_POST['filtro_id']) ? intval($_POST['filtro_id']) : 0;

    if ($id > 0) {
      $sql = "SELECT id, dominio, numero, descripcion, activa, id_usuario, revision, fecha, entrada_vigor FROM revisiones WHERE id=" . $id;
    } else {
      $sql = "SELECT id, dominio, numero, descripcion, activa, id_usuario, revision, fecha, entrada_vigor FROM revisiones";
      $where = array();

      if (!empty($_POST['filtro_nombre'])) {
        $filtro = mysqli_real_escape_string($link, $_POST['filtro_nombre']);
        $where[] = "revision LIKE '%" . $filtro . "%'";
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
        if ($row['entrada_vigor'] && $row['entrada_vigor'] != '0000-00-00') {
          $row['entrada_vigor_dmy'] = date("d-m-Y", strtotime($row['entrada_vigor']));
        } else {
          $row['entrada_vigor_dmy'] = '-';
        }
        $rows[] = $row;
      }
    }
    echo json_encode(array('resultados' => $rows));
    break;

  case 'create':
    $dominio     = isset($_POST['dominio'])      ? mysqli_real_escape_string($link, trim($_POST['dominio']))      : '';
    $numero      = isset($_POST['numero'])       ? intval($_POST['numero'])                                        : 0;
    $descripcion = isset($_POST['descripcion'])  ? mysqli_real_escape_string($link, trim($_POST['descripcion']))  : '';
    $activa      = isset($_POST['activa'])       ? intval($_POST['activa'])                                        : 0;
    $revision    = isset($_POST['revision'])     ? mysqli_real_escape_string($link, trim($_POST['revision']))     : '';
    $entrada_vigor = (!empty($_POST['entrada_vigor'])) ? mysqli_real_escape_string($link, $_POST['entrada_vigor']) : null;
    $id_usuario  = intval($_COOKIE['user_id']);

    if (!in_array($dominio, $DOMINIOS_VALIDOS)) {
      echo "Error: dominio no valido";
      break;
    }
    if ($revision === '') {
      echo "Error: el campo revision es obligatorio";
      break;
    }

    $entrada_sql = $entrada_vigor ? "'{$entrada_vigor}'" : "NULL";
    $sql = "INSERT INTO `revisiones` (`dominio`, `numero`, `descripcion`, `activa`, `id_usuario`, `revision`, `entrada_vigor`)
            VALUES ('{$dominio}', {$numero}, '{$descripcion}', {$activa}, {$id_usuario}, '{$revision}', {$entrada_sql})";

    if (mysqli_query($link, $sql)) {
      echo "OK";
    } else {
      echo "Error al insertar revision: " . mysqli_error($link);
    }
    break;

  case 'update':
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($id === 0) {
      echo "Error: ID no proporcionado";
      break;
    }
    $dominio     = isset($_POST['dominio'])      ? mysqli_real_escape_string($link, trim($_POST['dominio']))      : '';
    $numero      = isset($_POST['numero'])       ? intval($_POST['numero'])                                        : 0;
    $descripcion = isset($_POST['descripcion'])  ? mysqli_real_escape_string($link, trim($_POST['descripcion']))  : '';
    $activa      = isset($_POST['activa'])       ? intval($_POST['activa'])                                        : 0;
    $revision    = isset($_POST['revision'])     ? mysqli_real_escape_string($link, trim($_POST['revision']))     : '';
    $entrada_vigor = (!empty($_POST['entrada_vigor'])) ? mysqli_real_escape_string($link, $_POST['entrada_vigor']) : null;

    if (!in_array($dominio, $DOMINIOS_VALIDOS)) {
      echo "Error: dominio no valido";
      break;
    }

    $entrada_sql = $entrada_vigor ? "'{$entrada_vigor}'" : "NULL";
    $sql = "UPDATE `revisiones` SET
              `dominio`='{$dominio}',
              `numero`={$numero},
              `descripcion`='{$descripcion}',
              `activa`={$activa},
              `revision`='{$revision}',
              `entrada_vigor`={$entrada_sql}
            WHERE `id`={$id}";

    if (mysqli_query($link, $sql)) {
      echo "OK";
    } else {
      echo "Error al actualizar revision: " . mysqli_error($link);
    }
    break;

  case 'delete':
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($id === 0) {
      echo "KO";
      break;
    }
    $sql = "DELETE FROM `revisiones` WHERE `id`={$id} LIMIT 1";
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
