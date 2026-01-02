<?php

if(isset($_POST["filtro_total"])){
	$lim = $_POST["filtro_total"];
}else{
    $lim = 15;
}

if(isset($_POST["filtro_id"])){
  $id = $_POST["filtro_id"];
}else{
    $id = "";
}

include("conn_bbdd.php");
// $link = mysqli_connect("89.46.111.188", "Sql1396152", "5i4w182228", "Sql1396152_2");
// mysqli_query($link, "SET SESSION sql_mode='ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'");
// mysqli_set_charset($link,"utf8");

// Verifica si la conexión es exitosa
if (!$link) {
    die("Conexión fallida: " . mysqli_connect_error());
}


// Consulta para obtener la información de los mantenedores
$mantenedores_sql = "SELECT * FROM mantenedores";
$mantenedores_result = mysqli_query($link, $mantenedores_sql);

// Inicialización de un array para almacenar los datos de los mantenedores
$mantenedores = array();

// Bucle a través de cada fila de resultados de mantenedores y almacenamiento de datos en el array
while ($row = mysqli_fetch_assoc($mantenedores_result)) {
    $mantenedores[$row["id"]] = $row["mantenedor"];
}


if($id==""){
  // Define la consulta SQL
  $sql = "SELECT * FROM clientes";
  $where = array();
  if (!empty($_POST['filtro_rae'])) {
    $where[] = "rae LIKE '%{$_POST['filtro_rae']}%'";
  }
  if (!empty($_POST['filtro_direccion'])) {
    $where[] = "direccion LIKE '%{$_POST['filtro_direccion']}%'";
  }
  if (!empty($_POST['filtro_localidad'])) {
    $where[] = "localidad LIKE '%{$_POST['filtro_localidad']}%'";
  }
  if (!empty($_POST['filtro_cp'])) {
    $where[] = "cp LIKE '%{$_POST['filtro_cp']}%'";
  }
  if (!empty($_POST['filtro_nombre'])) {
    $where[] = "nombre LIKE '%{$_POST['filtro_nombre']}%'";
  }
  if (!empty($_POST['filtro_fecha_inicio'])) {
    $where[] = "vencimiento >= '{$_POST['filtro_fecha_inicio']}'";
  }
  if (!empty($_POST['filtro_fecha_fin'])) {
    $where[] = "vencimiento <= '{$_POST['filtro_fecha_fin']}'";
  }
  if (count($where) > 0) {
    $sql .= " WHERE " . implode(" AND ", $where);
  }
  $sql .= " ORDER BY id DESC LIMIT 0,{$lim}";
}else{
  $sql = "SELECT * FROM clientes WHERE id=$id";
}

// Ejecuta la consulta
$result = mysqli_query($link, $sql);

// Inicialización de un array para almacenar los datos
$resultados = array();

// Bucle a través de cada fila de resultados y almacenamiento de datos en el array
while ($orw = mysqli_fetch_assoc($result)) {
    if (isset($mantenedores[$row['id_mantenedor']])) {
      $row['mantenedor'] = $mantenedores[$row['id_mantenedor']];
    }else{
      $row['mantenedor'] = "-";
    }
    if($row['vencimiento']=="0000-00-00"){
      $row['vencimiento_dmy'] = "-";
    }else{
      $row['vencimiento_dmy'] = date("d-m-Y", strtotime($row['vencimiento']));
    }
    $resultados[] = $row;
}

// Cierre de la conexión a la base de datos
mysqli_close($link);

$retorno = array();
// añadimos una línea al final con los mantenedores
$retorno["mantenedores"] = $mantenedores;
$retorno["resultados"] = $resultados;

// Codificación del array de datos en formato JSON y envío como respuesta
echo json_encode($retorno);

?>