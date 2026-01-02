<?php
// Inserta un nuevo registro en datos_facturacion
if(!isset($_POST['id_cliente'])){ echo "KO"; exit; }

$id_cliente = intval($_POST['id_cliente']);
$fis_nombre = isset($_POST['titular']) ? $_POST['titular'] : '';
$fis_direccion = isset($_POST['direccion']) ? $_POST['direccion'] : '';
$fis_localidad = isset($_POST['localidad']) ? $_POST['localidad'] : '';
$fis_provincia = isset($_POST['provincia']) ? $_POST['provincia'] : '';
$fis_cp = isset($_POST['cp']) ? $_POST['cp'] : '';
$cif = isset($_POST['cif']) ? $_POST['cif'] : '';
$num_cuenta = isset($_POST['num_cuenta']) ? $_POST['num_cuenta'] : '';
$observaciones = isset($_POST['observaciones']) ? $_POST['observaciones'] : '';

include("conn_bbdd.php");
if (!$link) { echo "ERROR: no connection"; exit; }

// Escapar entradas
$fis_nombre = mysqli_real_escape_string($link, $fis_nombre);
$fis_direccion = mysqli_real_escape_string($link, $fis_direccion);
$fis_localidad = mysqli_real_escape_string($link, $fis_localidad);
$fis_provincia = mysqli_real_escape_string($link, $fis_provincia);
$fis_cp = mysqli_real_escape_string($link, $fis_cp);
$cif = mysqli_real_escape_string($link, $cif);
$num_cuenta = mysqli_real_escape_string($link, $num_cuenta);
$observaciones = mysqli_real_escape_string($link, $observaciones);

$sql = "INSERT INTO datos_facturacion (id_cliente, fis_nombre, fis_direccion, fis_localidad, fis_cp, fis_provincia, cif, num_cuenta, observaciones) VALUES ({$id_cliente}, '{$fis_nombre}', '{$fis_direccion}', '{$fis_localidad}', '{$fis_cp}', '{$fis_provincia}', '{$cif}', '{$num_cuenta}', '{$observaciones}')";

if(mysqli_query($link, $sql)){
    echo "OK";
}else{
    echo "ERROR: " . mysqli_error($link);
}

mysqli_close($link);
?>
