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
  $sql = "SELECT * FROM usuarios";
  $where = array();
  if (!empty($_POST['filtro_user'])) {
    $where[] = "`user` LIKE '%{$_POST['filtro_user']}%'";
  }
  if (!empty($_POST['filtro_name'])) {
    $where[] = "`name` LIKE '%{$_POST['filtro_name']}%'";
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
    $resultados[] = $row;
}

mysqli_close($link);

$retorno = array();
$retorno["resultados"] = $resultados;

echo json_encode($retorno);

?>