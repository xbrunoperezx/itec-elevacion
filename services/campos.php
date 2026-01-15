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
    // Listar campos con filtros opcionales
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
      $sql = "SELECT * FROM informe_campos";
      $where = array();
      if (!empty($_POST['filtro_abrev'])) {
        $where[] = "`abrev` LIKE '%" . mysqli_real_escape_string($link, $_POST['filtro_abrev']) . "%'";
      }
      if (!empty($_POST['filtro_nombre'])) {
        $where[] = "`nombre` LIKE '%" . mysqli_real_escape_string($link, $_POST['filtro_nombre']) . "%'";
      }
      if (count($where) > 0) {
        $sql .= " WHERE " . implode(" AND ", $where);
      }
      $sql .= " ORDER BY id ASC LIMIT 0,{$lim}";
    }else{
      $sql = "SELECT * FROM informe_campos WHERE id={$id}";
    }

    $result = mysqli_query($link, $sql);
    $resultados = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $resultados[] = $row;
    }

    $retorno = array();
    $retorno["resultados"] = $resultados;
    echo json_encode($retorno);
    break;

  case 'create':
    // Crear nuevo campo
    $id_revision = isset($_POST['id_revision']) ? intval($_POST['id_revision']) : 0;
    $tipo = isset($_POST['tipo']) ? mysqli_real_escape_string($link, $_POST['tipo']) : '';
    $nombre = isset($_POST['nombre']) ? mysqli_real_escape_string($link, $_POST['nombre']) : '';
    $abrev = isset($_POST['abrev']) ? mysqli_real_escape_string($link, $_POST['abrev']) : '';
    $unidad = isset($_POST['unidad']) ? mysqli_real_escape_string($link, $_POST['unidad']) : '';

    // Normalizar y validar 'tipo'
    $validTipos = array('MEDIDAS','CARACTERISTICAS');
    if(!in_array(strtoupper($tipo), $validTipos)){
      $tipo = 'MEDIDAS';
    } else {
      $tipo = strtoupper($tipo);
    }

    $cols = array('`id_revision`','`tipo`','`nombre`','`abrev`','`unidad`');
    $vals = array("{$id_revision}","'{$tipo}'","'{$nombre}'","'{$abrev}'","'{$unidad}'");
    $sql = "INSERT INTO `informe_campos` (" . implode(',', $cols) . ") VALUES (" . implode(',', $vals) . ")";

    if (mysqli_query($link, $sql)) {
        echo "OK";
    } else {
        echo "Error al insertar nuevo campo: " . mysqli_error($link);
    }
    break;

  case 'update':
    // Actualizar campo existente
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if($id == 0){
      echo "Error: ID no proporcionado";
      break;
    }

    $id_revision = isset($_POST['id_revision']) ? intval($_POST['id_revision']) : 0;
    $tipo = isset($_POST['tipo']) ? mysqli_real_escape_string($link, $_POST['tipo']) : '';
    $nombre = isset($_POST['nombre']) ? mysqli_real_escape_string($link, $_POST['nombre']) : '';
    $abrev = isset($_POST['abrev']) ? mysqli_real_escape_string($link, $_POST['abrev']) : '';
    $unidad = isset($_POST['unidad']) ? mysqli_real_escape_string($link, $_POST['unidad']) : '';

    // Normalizar y validar 'tipo'
    $validTipos = array('MEDIDAS','CARACTERISTICAS');
    if(!in_array(strtoupper($tipo), $validTipos)){
      $tipo = 'MEDIDAS';
    } else {
      $tipo = strtoupper($tipo);
    }

    $setParts = array();
    $setParts[] = "`id_revision`={$id_revision}";
    $setParts[] = "`tipo`='{$tipo}'";
    $setParts[] = "`nombre`='{$nombre}'";
    $setParts[] = "`abrev`='{$abrev}'";
    $setParts[] = "`unidad`='{$unidad}'";

    $sql = "UPDATE `informe_campos` SET " . implode(', ', $setParts) . " WHERE `id`={$id}";

    if (mysqli_query($link, $sql)) {
        echo "OK";
    } else {
        echo "Error al actualizar el campo: " . mysqli_error($link);
    }
    break;

  case 'delete':
    // Eliminar campo
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if($id == 0){
      echo "KO";
      break;
    }

    $sql = "DELETE FROM informe_campos WHERE id={$id} LIMIT 1";
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
