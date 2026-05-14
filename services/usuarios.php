<?php

// Comprobar cookie de sesión 'user_id'
if (!isset($_COOKIE['user_id'])) {
  echo json_encode(["error" => "KO: sesión ha expirado"]);
  exit;
}

include("conn_bbdd.php");

if (!$link) {
    die(json_encode(["error" => "Conexión fallida: " . mysqli_connect_error()]));
}

function normalize_equipos_ids($raw, &$error = null, $strict = true) {
  $error = null;

  if ($raw === null) return [];
  if (is_string($raw)) {
    $text = trim($raw);
    if ($text === '' || strtolower($text) === 'null') return [];
    $decoded = json_decode($text, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
      if ($strict) $error = 'Equipos JSON inválido';
      return $strict ? null : [];
    }
    $raw = $decoded;
  }

  $ids = [];

  if (is_array($raw)) {
    $isSequential = array_keys($raw) === range(0, count($raw) - 1);
    if ($isSequential) {
      foreach ($raw as $item) {
        if (is_array($item) && isset($item['id'])) {
          $idVal = intval($item['id']);
        } else {
          $idVal = intval($item);
        }
        if ($idVal > 0) $ids[] = $idVal;
      }
    } else {
      if (isset($raw['ids']) && is_array($raw['ids'])) {
        foreach ($raw['ids'] as $item) {
          $idVal = intval($item);
          if ($idVal > 0) $ids[] = $idVal;
        }
      } else {
        foreach ($raw as $key => $value) {
          $keyId = intval($key);
          if ($keyId > 0) {
            $ids[] = $keyId;
            continue;
          }
          $valId = intval($value);
          if ($valId > 0) $ids[] = $valId;
        }
      }
    }
  } else {
    if ($strict) $error = 'Equipos debe ser un array JSON de IDs';
    return $strict ? null : [];
  }

  $ids = array_values(array_unique(array_filter($ids, function($v){ return intval($v) > 0; })));
  sort($ids);
  return $ids;
}

function validate_equipos_exist($link, $ids, &$error = null) {
  $error = null;
  if (empty($ids)) return true;

  $idsInt = array_map('intval', $ids);
  $idsInt = array_values(array_unique(array_filter($idsInt, function($v){ return $v > 0; })));
  if (empty($idsInt)) return true;

  $in = implode(',', $idsInt);
  $sql = "SELECT `id` FROM `equipos` WHERE `id` IN ({$in})";
  $res = mysqli_query($link, $sql);
  if (!$res) {
    $error = 'Error validando equipos: ' . mysqli_error($link);
    return false;
  }

  $existing = [];
  while ($row = mysqli_fetch_assoc($res)) {
    $existing[] = intval($row['id']);
  }

  $missing = array_values(array_diff($idsInt, $existing));
  if (!empty($missing)) {
    $error = 'IDs de equipos no válidos: ' . implode(', ', $missing);
    return false;
  }

  return true;
}

// Determinar la acción solicitada
$action = isset($_POST['action']) ? $_POST['action'] : 'list';

switch($action) {
  case 'list':
    // Listar usuarios con filtros opcionales
    if(isset($_POST["filtro_total"])){
      $lim = intval($_POST["filtro_total"]);
    }else{
      $lim = 15;
    }

    if(isset($_POST["filtro_id"])){
      $id = intval($_POST["filtro_id"]);
    }else{
      $id = 0;
    }

    if($id==0){
      $sql = "SELECT * FROM usuarios";
      $where = array();
      if (!empty($_POST['filtro_user'])) {
        $f = mysqli_real_escape_string($link, $_POST['filtro_user']);
        $where[] = "`user` LIKE '%{$f}%'";
      }
      if (!empty($_POST['filtro_name'])) {
        $f = mysqli_real_escape_string($link, $_POST['filtro_name']);
        $where[] = "`name` LIKE '%{$f}%'";
      }
      if (!empty($_POST['filtro_email'])) {
        $f = mysqli_real_escape_string($link, $_POST['filtro_email']);
        $where[] = "`email` LIKE '%{$f}%'";
      }
      if (count($where) > 0) {
        $sql .= " WHERE " . implode(" AND ", $where);
      }
      $sql .= " ORDER BY id ASC LIMIT 0,{$lim}";
    }else{
      $sql = "SELECT * FROM usuarios WHERE id={$id}";
    }

    $result = mysqli_query($link, $sql);
    $resultados = array();
    while ($row = mysqli_fetch_assoc($result)) {
      // devolver equipos como lista normalizada de IDs
      if (isset($row['equipos']) && $row['equipos'] !== null && $row['equipos'] !== '') {
        $normErr = null;
        $row['equipos'] = normalize_equipos_ids($row['equipos'], $normErr, false);
      } else {
        $row['equipos'] = [];
      }
      $resultados[] = $row;
    }

    $retorno = array();
    $retorno["resultados"] = $resultados;
    echo json_encode($retorno);
    break;

  case 'create':
    // Crear nuevo usuario
    $user = isset($_POST['user']) ? mysqli_real_escape_string($link, $_POST['user']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $name = isset($_POST['name']) ? mysqli_real_escape_string($link, $_POST['name']) : '';
    $email = isset($_POST['email']) ? mysqli_real_escape_string($link, $_POST['email']) : '';
    $extension = isset($_POST['extension']) ? mysqli_real_escape_string($link, $_POST['extension']) : '';
    $pphone = isset($_POST['pphone']) ? mysqli_real_escape_string($link, $_POST['pphone']) : '';
    $oficina = isset($_POST['oficina']) ? mysqli_real_escape_string($link, $_POST['oficina']) : '';
    $puesto = isset($_POST['puesto']) ? mysqli_real_escape_string($link, $_POST['puesto']) : '';
    $tipo = isset($_POST['tipo']) ? mysqli_real_escape_string($link, $_POST['tipo']) : '';
    $abrev = isset($_POST['abrev']) ? mysqli_real_escape_string($link, $_POST['abrev']) : '';
    $equipos_raw = isset($_POST['equipos']) ? $_POST['equipos'] : '';

    // Procesar y validar equipos como lista de IDs
    $equipos_error = null;
    $equipos_ids = normalize_equipos_ids($equipos_raw, $equipos_error, true);
    if ($equipos_ids === null) {
      echo 'Error al validar equipos: ' . $equipos_error;
      break;
    }
    if (!validate_equipos_exist($link, $equipos_ids, $equipos_error)) {
      echo 'Error al validar equipos: ' . $equipos_error;
      break;
    }

    // Hash de contraseña (usar '1234' por defecto si no se envió)
    $hasPassword = (isset($password) && trim($password) !== '');
    if(!$hasPassword){
      $password_hashed = md5('1234');
    } else {
      $password_hashed = md5($password);
    }
    $password_hashed = mysqli_real_escape_string($link, $password_hashed);

    $cols = array('`user`','`password`','`name`','`email`','`extension`','`pphone`','`oficina`','`puesto`','`tipo`','`abrev`','`equipos`');
    $vals = array("'{$user}'","'{$password_hashed}'","'{$name}'","'{$email}'","'{$extension}'","'{$pphone}'","'{$oficina}'","'{$puesto}'","'{$tipo}'","'{$abrev}'");
    if(empty($equipos_ids)){
      $vals[] = "NULL";
    } else {
      $equipos_json = json_encode($equipos_ids, JSON_UNESCAPED_UNICODE);
      $equipos_json = mysqli_real_escape_string($link, $equipos_json);
      $vals[] = "'{$equipos_json}'";
    }

    $sql = "INSERT INTO `usuarios` (" . implode(',', $cols) . ") VALUES (" . implode(',', $vals) . ")";

    if (mysqli_query($link, $sql)) {
        echo "OK";
    } else {
        echo "Error al insertar nuevo usuario: " . mysqli_error($link);
    }
    break;

  case 'update':
    // Actualizar usuario existente
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if($id == 0){
      echo "Error: ID no proporcionado";
      break;
    }

    $user = isset($_POST['user']) ? mysqli_real_escape_string($link, $_POST['user']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $name = isset($_POST['name']) ? mysqli_real_escape_string($link, $_POST['name']) : '';
    $email = isset($_POST['email']) ? mysqli_real_escape_string($link, $_POST['email']) : '';
    $extension = isset($_POST['extension']) ? mysqli_real_escape_string($link, $_POST['extension']) : '';
    $pphone = isset($_POST['pphone']) ? mysqli_real_escape_string($link, $_POST['pphone']) : '';
    $oficina = isset($_POST['oficina']) ? mysqli_real_escape_string($link, $_POST['oficina']) : '';
    $puesto = isset($_POST['puesto']) ? mysqli_real_escape_string($link, $_POST['puesto']) : '';
    $tipo = isset($_POST['tipo']) ? mysqli_real_escape_string($link, $_POST['tipo']) : '';
    $abrev = isset($_POST['abrev']) ? mysqli_real_escape_string($link, $_POST['abrev']) : '';
    $equipos_raw = isset($_POST['equipos']) ? $_POST['equipos'] : '';

    // Procesar y validar equipos como lista de IDs
    $equipos_error = null;
    $equipos_ids = normalize_equipos_ids($equipos_raw, $equipos_error, true);
    if ($equipos_ids === null) {
      echo 'Error al validar equipos: ' . $equipos_error;
      break;
    }
    if (!validate_equipos_exist($link, $equipos_ids, $equipos_error)) {
      echo 'Error al validar equipos: ' . $equipos_error;
      break;
    }

    $setParts = array();
    $setParts[] = "`user`='{$user}'";
    
    // Solo actualizar password si se envió
    $hasPassword = (isset($password) && trim($password) !== '');
    if($hasPassword){
      $password_hashed = md5($password);
      $password_hashed = mysqli_real_escape_string($link, $password_hashed);
      $setParts[] = "`password`='{$password_hashed}'";
    }
    
    $setParts[] = "`name`='{$name}'";
    $setParts[] = "`email`='{$email}'";
    $setParts[] = "`extension`='{$extension}'";
    $setParts[] = "`pphone`='{$pphone}'";
    $setParts[] = "`oficina`='{$oficina}'";
    $setParts[] = "`puesto`='{$puesto}'";
    $setParts[] = "`tipo`='{$tipo}'";
    $setParts[] = "`abrev`='{$abrev}'";
    if(empty($equipos_ids)){
      $setParts[] = "`equipos`=NULL";
    } else {
      $equipos_json = json_encode($equipos_ids, JSON_UNESCAPED_UNICODE);
      $equipos_json = mysqli_real_escape_string($link, $equipos_json);
      $setParts[] = "`equipos`='{$equipos_json}'";
    }

    $sql = "UPDATE `usuarios` SET " . implode(', ', $setParts) . " WHERE `id`={$id}";

    if (mysqli_query($link, $sql)) {
        echo "OK";
    } else {
        echo "Error al actualizar el usuario: " . mysqli_error($link);
    }
    break;

  case 'delete':
    // Eliminar usuario
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if($id == 0){
      echo "KO";
      break;
    }

    $sql = "DELETE FROM usuarios WHERE id={$id} LIMIT 1";
    if(mysqli_query($link, $sql)){
        echo "OK";
    }else{
        echo "ERROR: " . mysqli_error($link);
    }
    break;

  default:
    echo json_encode(["error" => "Acción no válida"]);
    break;
}

mysqli_close($link);

?>