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

mysqli_close($link);

$retorno = array();
$retorno["resultados"] = $resultados;

echo json_encode($retorno);

?>
