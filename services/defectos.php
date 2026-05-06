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

function getLegislacionesAbrev($link){
  $out = array();
  $sql = "SELECT id, abrev, nombre FROM legislacion ORDER BY id ASC";
  $res = mysqli_query($link, $sql);
  if ($res) {
    while ($r = mysqli_fetch_assoc($res)) {
      $out[] = $r;
    }
  }
  return $out;
}

function getLegislacionesAbrevList($link){
  $out = array();
  $sql = "SELECT abrev FROM legislacion WHERE abrev IS NOT NULL AND abrev <> '' ORDER BY id ASC";
  $res = mysqli_query($link, $sql);
  if ($res) {
    while ($r = mysqli_fetch_assoc($res)) {
      $out[] = $r['abrev'];
    }
  }
  return $out;
}

function parseBoolLike($value){
  if (is_bool($value)) return $value;
  if ($value === 1 || $value === '1') return true;
  if ($value === 0 || $value === '0') return false;
  if ($value === 'true' || $value === 'TRUE') return true;
  if ($value === 'false' || $value === 'FALSE') return false;
  return null;
}

function normalizeAplicabilidadJson($link, $jsonRaw, &$errorMsg){
  $errorMsg = '';
  $abrevs = getLegislacionesAbrevList($link);
  if (count($abrevs) === 0) {
    return null;
  }

  if ($jsonRaw === null || trim($jsonRaw) === '') {
    $defaultObj = array();
    foreach ($abrevs as $ab) {
      $defaultObj[$ab] = false;
    }
    return json_encode($defaultObj, JSON_UNESCAPED_UNICODE);
  }

  $decoded = json_decode($jsonRaw, true);
  if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
    $errorMsg = "Error: aplicabilidad no es JSON valido";
    return false;
  }

  $validAbrevs = array_flip($abrevs);
  $normalized = array();

  foreach ($abrevs as $ab) {
    if (array_key_exists($ab, $decoded)) {
      $boolVal = parseBoolLike($decoded[$ab]);
      if ($boolVal === null) {
        $errorMsg = "Error: aplicabilidad[" . $ab . "] debe ser true o false";
        return false;
      }
      $normalized[$ab] = $boolVal;
    } else {
      $normalized[$ab] = false;
    }
  }

  foreach ($decoded as $key => $value) {
    if (!isset($validAbrevs[$key])) {
      $errorMsg = "Error: clave de aplicabilidad no valida: " . $key;
      return false;
    }
  }

  return json_encode($normalized, JSON_UNESCAPED_UNICODE);
}

function decodeAplicabilidad($value){
  if ($value === null || $value === '') return null;
  $decoded = json_decode($value, true);
  if (json_last_error() === JSON_ERROR_NONE) return $decoded;
  return $value;
}

switch($action){
  case 'list':
    $lim = isset($_POST['filtro_total']) ? intval($_POST['filtro_total']) : 15;
    if ($lim <= 0) $lim = 15;
    $id = isset($_POST['filtro_id']) ? intval($_POST['filtro_id']) : 0;

    if ($id > 0) {
      $sql = "SELECT id, provincia, codigo, defecto, valoracion, leve, grave, muygrave, aplicabilidad, id_revision FROM check_ascensores WHERE id=" . $id;
    } else {
      $sql = "SELECT id, provincia, codigo, defecto, valoracion, leve, grave, muygrave, aplicabilidad, id_revision FROM check_ascensores";
      $where = array();

      if (!empty($_POST['filtro_codigo'])) {
        $codigo = mysqli_real_escape_string($link, $_POST['filtro_codigo']);
        $where[] = "codigo LIKE '%" . $codigo . "%'";
      }
      if (!empty($_POST['filtro_defecto'])) {
        $defecto = mysqli_real_escape_string($link, $_POST['filtro_defecto']);
        $where[] = "defecto LIKE '%" . $defecto . "%'";
      }

      if (!empty($_POST['filtro_legislacion'])) {
        $filtroLeg = trim($_POST['filtro_legislacion']);
        // Validar que la clave existe en la tabla legislacion para evitar inyeccion
        $validAbrevs = getLegislacionesAbrevList($link);
        if (in_array($filtroLeg, $validAbrevs, true)) {
          $safeLeg = mysqli_real_escape_string($link, $filtroLeg);
          $where[] = "JSON_UNQUOTE(JSON_EXTRACT(aplicabilidad, '$.\"" . $safeLeg . "\"')) = 'true'";
        }
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
        $row['aplicabilidad'] = decodeAplicabilidad($row['aplicabilidad']);
        $rows[] = $row;
      }
    }

    echo json_encode(array(
      'resultados' => $rows,
      'legislaciones' => getLegislacionesAbrev($link)
    ));
    break;

  case 'create':
    $provincia = isset($_POST['provincia']) ? mysqli_real_escape_string($link, trim($_POST['provincia'])) : '';
    $codigo = isset($_POST['codigo']) ? mysqli_real_escape_string($link, trim($_POST['codigo'])) : '';
    $defecto = isset($_POST['defecto']) ? mysqli_real_escape_string($link, trim($_POST['defecto'])) : '';
    $valoracion = isset($_POST['valoracion']) ? mysqli_real_escape_string($link, trim($_POST['valoracion'])) : '';
    $id_revision = isset($_POST['id_revision']) ? intval($_POST['id_revision']) : 0;
    $leve = isset($_POST['leve']) ? intval($_POST['leve']) : 0;
    $grave = isset($_POST['grave']) ? intval($_POST['grave']) : 0;
    $muygrave = isset($_POST['muygrave']) ? intval($_POST['muygrave']) : 0;

    $aplicabilidad = null;
    $normalizeError = '';
    $normalizedJson = normalizeAplicabilidadJson($link, isset($_POST['aplicabilidad']) ? $_POST['aplicabilidad'] : null, $normalizeError);
    if ($normalizedJson === false) {
      echo $normalizeError;
      break;
    }
    if ($normalizedJson !== null) {
      $aplicabilidad = mysqli_real_escape_string($link, $normalizedJson);
    }

    // Compatibilidad: si aun existen columnas aplica1..aplica15, se rellenan a 0
    $hasAplicaCols = false;
    $checkColRes = mysqli_query($link, "SHOW COLUMNS FROM check_ascensores LIKE 'aplica1'");
    if ($checkColRes && mysqli_num_rows($checkColRes) > 0) {
      $hasAplicaCols = true;
    }

    $cols = array('provincia', 'codigo', 'defecto', 'valoracion', 'leve', 'grave', 'muygrave', 'aplicabilidad', 'id_revision');
    $vals = array(
      "'" . $provincia . "'",
      "'" . $codigo . "'",
      "'" . $defecto . "'",
      "'" . $valoracion . "'",
      $leve,
      $grave,
      $muygrave,
      ($aplicabilidad === null ? "NULL" : ("'" . $aplicabilidad . "'")),
      $id_revision
    );

    if ($hasAplicaCols) {
      for ($i = 1; $i <= 15; $i++) {
        $cols[] = 'aplica' . $i;
        $vals[] = 0;
      }
    }

    $sql = "INSERT INTO check_ascensores (" . implode(',', $cols) . ") VALUES (" . implode(',', $vals) . ")";

    if (mysqli_query($link, $sql)) {
      echo "OK";
    } else {
      echo "Error al insertar defecto: " . mysqli_error($link);
    }
    break;

  case 'update':
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($id <= 0) {
      echo "Error: ID no proporcionado";
      break;
    }

    $provincia = isset($_POST['provincia']) ? mysqli_real_escape_string($link, trim($_POST['provincia'])) : '';
    $codigo = isset($_POST['codigo']) ? mysqli_real_escape_string($link, trim($_POST['codigo'])) : '';
    $defecto = isset($_POST['defecto']) ? mysqli_real_escape_string($link, trim($_POST['defecto'])) : '';
    $valoracion = isset($_POST['valoracion']) ? mysqli_real_escape_string($link, trim($_POST['valoracion'])) : '';
    $id_revision = isset($_POST['id_revision']) ? intval($_POST['id_revision']) : 0;
    $leve = isset($_POST['leve']) ? intval($_POST['leve']) : 0;
    $grave = isset($_POST['grave']) ? intval($_POST['grave']) : 0;
    $muygrave = isset($_POST['muygrave']) ? intval($_POST['muygrave']) : 0;

    $aplicabilidadSql = "NULL";
    $normalizeError = '';
    $normalizedJson = normalizeAplicabilidadJson($link, isset($_POST['aplicabilidad']) ? $_POST['aplicabilidad'] : null, $normalizeError);
    if ($normalizedJson === false) {
      echo $normalizeError;
      break;
    }
    if ($normalizedJson !== null) {
      $aplicabilidadSql = "'" . mysqli_real_escape_string($link, $normalizedJson) . "'";
    }

    $setParts = array();
    $setParts[] = "provincia='" . $provincia . "'";
    $setParts[] = "codigo='" . $codigo . "'";
    $setParts[] = "defecto='" . $defecto . "'";
    $setParts[] = "valoracion='" . $valoracion . "'";
    $setParts[] = "leve=" . $leve;
    $setParts[] = "grave=" . $grave;
    $setParts[] = "muygrave=" . $muygrave;
    $setParts[] = "aplicabilidad=" . $aplicabilidadSql;
    $setParts[] = "id_revision=" . $id_revision;

    $sql = "UPDATE check_ascensores SET " . implode(', ', $setParts) . " WHERE id=" . $id;

    if (mysqli_query($link, $sql)) {
      echo "OK";
    } else {
      echo "Error al actualizar defecto: " . mysqli_error($link);
    }
    break;

  case 'delete':
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if ($id <= 0) {
      echo "KO";
      break;
    }

    $sql = "DELETE FROM check_ascensores WHERE id=" . $id . " LIMIT 1";
    if (mysqli_query($link, $sql)) {
      echo "OK";
    } else {
      echo "ERROR: " . mysqli_error($link);
    }
    break;

  default:
    echo json_encode(array('error' => 'Accion no valida'));
    break;
}

mysqli_close($link);

?>
