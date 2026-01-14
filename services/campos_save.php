<?php

// Comprobar cookie de sesión 'user_id'
if (!isset($_COOKIE['user_id'])) {
  echo "KO: sesión ha expirado";
  exit;
}

$id = isset($_POST['id']) ? $_POST['id'] : '';
$id_revision = isset($_POST['id_revision']) ? $_POST['id_revision'] : '';
$tipo = isset($_POST['tipo']) ? $_POST['tipo'] : '';
$nombre = isset($_POST['nombre']) ? $_POST['nombre'] : '';
$abrev = isset($_POST['abrev']) ? $_POST['abrev'] : '';
$unidad = isset($_POST['unidad']) ? $_POST['unidad'] : '';

include("conn_bbdd.php");

// Verifica si la conexión es exitosa
if (!$link) {
    die("Conexión fallida: " . mysqli_connect_error());
}

// Escapar valores para seguridad
$id_revision = intval($id_revision);
$tipo = mysqli_real_escape_string($link, $tipo);
$nombre = mysqli_real_escape_string($link, $nombre);
$abrev = mysqli_real_escape_string($link, $abrev);
$unidad = mysqli_real_escape_string($link, $unidad);

// Normalizar y validar 'tipo' (solo permitir MEDIDAS o CARACTERISTICAS)
$validTipos = array('MEDIDAS','CARACTERISTICAS');
if(!in_array(strtoupper($tipo), $validTipos)){
  $tipo = 'MEDIDAS';
} else {
  $tipo = strtoupper($tipo);
}

// Si se proporciona un id no vacío, hacemos UPDATE, si no hacemos INSERT
if(isset($_POST['id']) && $_POST['id'] !== ''){
  $id = intval($_POST['id']);
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
} else {
  // INSERT
  $cols = array('`id_revision`','`tipo`','`nombre`','`abrev`','`unidad`');
  $vals = array("{$id_revision}","'{$tipo}'","'{$nombre}'","'{$abrev}'","'{$unidad}'");

  $sql = "INSERT INTO `informe_campos` (" . implode(',', $cols) . ") VALUES (" . implode(',', $vals) . ")";

  if (mysqli_query($link, $sql)) {
      echo "OK";
  } else {
      echo "Error al insertar nuevo campo: " . mysqli_error($link);
  }
}

mysqli_close($link);

?>
