<?php

if(isset($_POST["id"])){
  $id = isset($_POST['id']) ? $_POST['id'] : '';
  $rae = isset($_POST['rae']) ? $_POST['rae'] : '';
  $nombre = isset($_POST['nombre']) ? $_POST['nombre'] : '';
  $direccion = isset($_POST['direccion']) ? $_POST['direccion'] : '';
  $localidad = isset($_POST['localidad']) ? $_POST['localidad'] : '';
  $municipio = isset($_POST['municipio']) ? $_POST['municipio'] : '';
  $cp = isset($_POST['cp']) ? $_POST['cp'] : '';
  $provincia = isset($_POST['provincia']) ? $_POST['provincia'] : '';
  $quien_contrata = isset($_POST['quien_contrata']) ? $_POST['quien_contrata'] : '';
  $observaciones = isset($_POST['observaciones']) ? $_POST['observaciones'] : '';
  $id_mantenedor = isset($_POST['id_mantenedor']) ? $_POST['id_mantenedor'] : '';
  $vencimiento = isset($_POST['vencimiento']) ? $_POST['vencimiento'] : '0000-00-00';
  $cada = isset($_POST['cada']) ? $_POST['cada'] : '';
  $id_administrador = isset($_POST['id_administrador']) ? $_POST['id_administrador'] : '';
  $telefono = isset($_POST['telefono']) ? $_POST['telefono'] : '';
  $telefono2 = isset($_POST['telefono2']) ? $_POST['telefono2'] : '';
  $email = isset($_POST['email']) ? $_POST['email'] : '';

  include("conn_bbdd.php");
  // $link = mysqli_connect("89.46.111.188", "Sql1396152", "5i4w182228", "Sql1396152_2");
  // mysqli_query($link, "SET SESSION sql_mode='ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'");
  // mysqli_set_charset($link,"utf8");

  // Verifica si la conexión es exitosa
  if (!$link) {
      die("Conexión fallida: " . mysqli_connect_error());
  }

  $sql = "UPDATE clientes SET rae='{$rae}',nombre='{$nombre}',direccion='{$direccion}',localidad='{$localidad}',municipio='{$municipio}',cp='{$cp}',provincia='{$provincia}',quien_contrata='{$quien_contrata}',observaciones='{$observaciones}',id_mantenedor='{$id_mantenedor}',vencimiento='{$vencimiento}',cada='{$cada}',id_administrador='{$id_administrador}',telefono='{$telefono}',telefono2='{$telefono2}',email='{$email}' WHERE id='{$id}'";

  if (mysqli_query($link, $sql)) {
      echo "OK";
  } else {
      echo "Error al actualizar los datos del cliente: " . mysqli_error($link);
  }

  // Cierre de la conexión a la base de datos
  mysqli_close($link);

}else{
  echo "KO";
}

?>