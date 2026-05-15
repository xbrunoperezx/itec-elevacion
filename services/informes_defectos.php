<?php

// Comprobar cookie de sesion 'user_id'
if (!isset($_COOKIE['user_id'])) {
  echo json_encode(["success" => false, "error" => "KO: sesión ha expirado"]);
  exit;
}

include("conn_bbdd.php");

if (!$link) {
  die(json_encode(["success" => false, "error" => "Conexión fallida: " . mysqli_connect_error()]));
}

$action = isset($_POST['action']) ? $_POST['action'] : 'list';

if ($action === 'list_by_informe') {
  $id_informe = isset($_POST['id_informe']) ? intval($_POST['id_informe']) : 0;
  
  if ($id_informe === 0) {
    echo json_encode(["success" => false, "error" => "ID informe inválido"]);
    exit;
  }
  
  // Asumiendo estructura: id, id_informe, codigo, descripcion, valoracion
  $sql = "SELECT id, codigo, descripcion, valoracion FROM informes_defectos WHERE id_informe = " . $id_informe . " ORDER BY id ASC";
  $res = mysqli_query($link, $sql);
  
  if (!$res) {
    echo json_encode(["success" => false, "error" => "Error en consulta: " . mysqli_error($link)]);
    exit;
  }
  
  $data = array();
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  
  echo json_encode(["success" => true, "data" => $data]);
  exit;
}

if ($action === 'list_check_ascensores') {
  // Obtener todos los defectos del catálogo (check_ascensores)
  $sql = "SELECT id, codigo, defecto, valoracion FROM check_ascensores ORDER BY codigo ASC";
  $res = mysqli_query($link, $sql);
  
  if (!$res) {
    echo json_encode(["success" => false, "error" => "Error en consulta"]);
    exit;
  }
  
  $data = array();
  while ($row = mysqli_fetch_assoc($res)) {
    $data[] = $row;
  }
  
  echo json_encode(["success" => true, "data" => $data]);
  exit;
}

if ($action === 'delete_all_by_informe') {
  $id_informe = isset($_POST['id_informe']) ? intval($_POST['id_informe']) : 0;
  
  if ($id_informe === 0) {
    echo json_encode(["success" => false, "error" => "ID informe inválido"]);
    exit;
  }
  
  $sql = "DELETE FROM informes_defectos WHERE id_informe = " . $id_informe;
  
  if (!mysqli_query($link, $sql)) {
    echo json_encode(["success" => false, "error" => "Error al eliminar: " . mysqli_error($link)]);
    exit;
  }
  
  echo json_encode(["success" => true]);
  exit;
}

if ($action === 'save') {
  $id_informe = isset($_POST['id_informe']) ? intval($_POST['id_informe']) : 0;
  $defectos_json = isset($_POST['defectos_json']) ? $_POST['defectos_json'] : '[]';
  
  if ($id_informe === 0) {
    echo json_encode(["success" => false, "error" => "ID informe inválido"]);
    exit;
  }
  
  $defectos = json_decode($defectos_json, true);
  
  if (!is_array($defectos)) {
    echo json_encode(["success" => false, "error" => "Formato de defectos inválido"]);
    exit;
  }
  
  // Primero eliminar todos los defectos existentes
  $sql_delete = "DELETE FROM informes_defectos WHERE id_informe = " . $id_informe;
  
  if (!mysqli_query($link, $sql_delete)) {
    echo json_encode(["success" => false, "error" => "Error al eliminar defectos anteriores: " . mysqli_error($link)]);
    exit;
  }
  
  // Insertar nuevos defectos
  foreach ($defectos as $defecto) {
    $codigo = isset($defecto['codigo']) ? "'" . mysqli_real_escape_string($link, $defecto['codigo']) . "'" : "NULL";
    $descripcion = isset($defecto['descripcion']) ? "'" . mysqli_real_escape_string($link, $defecto['descripcion']) . "'" : "NULL";
    $valoracion = isset($defecto['valoracion']) ? "'" . mysqli_real_escape_string($link, $defecto['valoracion']) . "'" : "NULL";
    
    $sql_insert = "INSERT INTO informes_defectos (id_informe, codigo, descripcion, valoracion) VALUES (" . $id_informe . ", " . $codigo . ", " . $descripcion . ", " . $valoracion . ")";
    
    if (!mysqli_query($link, $sql_insert)) {
      echo json_encode(["success" => false, "error" => "Error al insertar defecto: " . mysqli_error($link)]);
      exit;
    }
  }
  
  echo json_encode(["success" => true]);
  exit;
}

echo json_encode(["success" => false, "error" => "Acción no reconocida"]);
?>
