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

$action = isset($_POST['action']) ? $_POST['action'] : 'list';

switch($action) {
  case 'list':
    $lim = isset($_POST["filtro_total"]) ? intval($_POST["filtro_total"]) : 15;
    $id = isset($_POST["filtro_id"]) ? intval($_POST["filtro_id"]) : 0;

    // Construir mapeo de mantenedores (id => mantenedor)
    $mantenedores = array();
    $m_sql = "SELECT * FROM mantenedores";
    $m_result = mysqli_query($link, $m_sql);
    while ($r = mysqli_fetch_assoc($m_result)) {
      $mantenedores[$r['id']] = $r['mantenedor'];
    }

    if($id==0){
      $sql = "SELECT * FROM mantenedores";
      $where = array();
      if (!empty($_POST['filtro_nombre'])) {
        $where[] = "`mantenedor` LIKE '%" . mysqli_real_escape_string($link, $_POST['filtro_nombre']) . "%'";
      }
      if (!empty($_POST['filtro_corto'])) {
        $where[] = "`corto` LIKE '%" . mysqli_real_escape_string($link, $_POST['filtro_corto']) . "%'";
      }
      if (count($where) > 0) {
        $sql .= " WHERE " . implode(" AND ", $where);
      }
      $sql .= " ORDER BY id ASC LIMIT 0,{$lim}";
    }else{
      $sql = "SELECT * FROM mantenedores WHERE id={$id}";
    }

    $result = mysqli_query($link, $sql);
    $resultados = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $resultados[] = $row;
    }

    $retorno = array();
    $retorno["resultados"] = $resultados;
    $retorno["mantenedores"] = $mantenedores;
    echo json_encode($retorno);
    break;

  case 'create':
    $mantenedor = isset($_POST['mantenedor']) ? mysqli_real_escape_string($link, $_POST['mantenedor']) : '';
    $corto = isset($_POST['corto']) ? mysqli_real_escape_string($link, $_POST['corto']) : '';

    $cols = array('`mantenedor`','`corto`');
    $vals = array("'{$mantenedor}'","'{$corto}'");
    $sql = "INSERT INTO `mantenedores` (" . implode(',', $cols) . ") VALUES (" . implode(',', $vals) . ")";

    if (mysqli_query($link, $sql)) {
        echo "OK";
    } else {
        echo "Error al insertar mantenedor: " . mysqli_error($link);
    }
    break;

  case 'update':
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if($id == 0){
      echo "Error: ID no proporcionado";
      break;
    }
    $mantenedor = isset($_POST['mantenedor']) ? mysqli_real_escape_string($link, $_POST['mantenedor']) : '';
    $corto = isset($_POST['corto']) ? mysqli_real_escape_string($link, $_POST['corto']) : '';

    $setParts = array();
    $setParts[] = "`mantenedor`='{$mantenedor}'";
    $setParts[] = "`corto`='{$corto}'";

    $sql = "UPDATE `mantenedores` SET " . implode(', ', $setParts) . " WHERE `id`={$id}";

    if (mysqli_query($link, $sql)) {
        echo "OK";
    } else {
        echo "Error al actualizar mantenedor: " . mysqli_error($link);
    }
    break;

  case 'delete':
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    if($id == 0){
      echo "KO";
      break;
    }

    $sql = "DELETE FROM mantenedores WHERE id={$id} LIMIT 1";
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
