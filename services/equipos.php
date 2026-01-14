<?php

// Comprobar cookie de sesión 'user_id'
if (!isset($_COOKIE['user_id'])) {
  echo json_encode(["error" => "KO: sesión ha expirado"]);
  exit;
}

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

include("conn_bbdd.php");

if (!$link) {
    die(json_encode(["error" => "Conexión fallida: " . mysqli_connect_error()]));
}

// Base SQL
if($id==0){
  $sql = "SELECT * FROM equipos";
  $where = array();
  if (!empty($_POST['filtro_codigo'])) {
    $where[] = "`codigo` LIKE '%" . mysqli_real_escape_string($link, $_POST['filtro_codigo']) . "%'";
  }
  if (!empty($_POST['filtro_nombre'])) {
    $where[] = "`nombre` LIKE '%" . mysqli_real_escape_string($link, $_POST['filtro_nombre']) . "%'";
  }
  if (count($where) > 0) {
    $sql .= " WHERE " . implode(" AND ", $where);
  }
  $sql .= " ORDER BY id ASC LIMIT 0,{$lim}";
}else{
  $sql = "SELECT * FROM equipos WHERE id={$id}";
}

$result = mysqli_query($link, $sql);

$resultados = array();
while ($row = mysqli_fetch_assoc($result)) {
    if($row['ultima_calibracion']=="0000-00-00" || empty($row['ultima_calibracion'])){
      $row['ultima_calibracion_dmy'] = "-";
    }else{
      $row['ultima_calibracion_dmy'] = date("d-m-Y", strtotime($row['ultima_calibracion']));
    }  
    if($row['prox_calibracion']=="0000-00-00" || empty($row['prox_calibracion'])){
      $row['prox_calibracion_dmy'] = "-";
    }else{
        $row['prox_calibracion_dmy'] = date("d-m-Y", strtotime($row['prox_calibracion']));
    }
    $resultados[] = $row;
}

mysqli_close($link);

$retorno = array();
$retorno["resultados"] = $resultados;

echo json_encode($retorno);

?>
