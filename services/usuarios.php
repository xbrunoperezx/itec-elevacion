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
        $where[] = "`user` LIKE '%{$_POST['filtro_user']}%'";
      }
      if (!empty($_POST['filtro_name'])) {
        $where[] = "`name` LIKE '%{$_POST['filtro_name']}%'";
      }
      if (!empty($_POST['filtro_email'])) {
        $where[] = "`email` LIKE '%{$_POST['filtro_email']}%'";
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
      // si el campo 'equipos' existe y contiene JSON, decodificarlo
      if (isset($row['equipos']) && $row['equipos'] !== null && $row['equipos'] !== '') {
        $decoded = json_decode($row['equipos'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
          $row['equipos'] = $decoded;
        }
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
    $equipos = isset($_POST['equipos']) ? $_POST['equipos'] : '';

    // Procesar equipos JSON
    $equipos_is_null = false;
    if(isset($equipos) && trim($equipos) !== ''){
      $decoded_equipos = json_decode($equipos, true);
      if(json_last_error() !== JSON_ERROR_NONE){
        $equipos_is_null = true;
        $equipos = null;
      } else {
        $equipos = json_encode($decoded_equipos, JSON_UNESCAPED_UNICODE);
        $equipos_is_null = false;
      }
    } else {
      $equipos_is_null = true;
      $equipos = null;
    }
    if(!$equipos_is_null){
      $equipos = mysqli_real_escape_string($link, $equipos);
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
    if($equipos_is_null){
      $vals[] = "NULL";
    } else {
      $vals[] = "'{$equipos}'";
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
    $equipos = isset($_POST['equipos']) ? $_POST['equipos'] : '';

    // Procesar equipos JSON
    $equipos_is_null = false;
    if(isset($equipos) && trim($equipos) !== ''){
      $decoded_equipos = json_decode($equipos, true);
      if(json_last_error() !== JSON_ERROR_NONE){
        $equipos_is_null = true;
        $equipos = null;
      } else {
        $equipos = json_encode($decoded_equipos, JSON_UNESCAPED_UNICODE);
        $equipos_is_null = false;
      }
    } else {
      $equipos_is_null = true;
      $equipos = null;
    }
    if(!$equipos_is_null){
      $equipos = mysqli_real_escape_string($link, $equipos);
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
    if($equipos_is_null){
      $setParts[] = "`equipos`=NULL";
    } else {
      $setParts[] = "`equipos`='{$equipos}'";
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