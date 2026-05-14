<?php
session_start();
header('Content-Type: application/json');

if (!isset($_COOKIE['user_id'])) {
  echo json_encode(array('success' => false, 'error' => 'KO: sesión ha expirado'));
  exit;
}

include_once('conn_bbdd.php');

if (!$link) {
  echo json_encode(array('success' => false, 'error' => 'Conexión fallida: ' . mysqli_connect_error()));
  exit;
}

$action = isset($_POST['action']) ? $_POST['action'] : '';
$id_informe = isset($_POST['id_informe']) ? intval($_POST['id_informe']) : 0;

if ($id_informe <= 0) {
  echo json_encode(array('success' => false, 'error' => 'ID informe no válido'));
  mysqli_close($link);
  exit;
}

if ($action === 'get') {
  $sql = "SELECT `mime_type`, `firma` FROM `informes_firmas` WHERE `id_informe` = {$id_informe} LIMIT 1";
  $res = mysqli_query($link, $sql);
  if (!$res) {
    echo json_encode(array('success' => false, 'error' => 'Error consultando firma: ' . mysqli_error($link)));
    mysqli_close($link);
    exit;
  }

  if (mysqli_num_rows($res) > 0) {
    $row = mysqli_fetch_assoc($res);
    $mime = (!empty($row['mime_type'])) ? $row['mime_type'] : 'image/png';
    $binary = $row['firma'];
    if ($binary !== null && $binary !== '') {
      $dataUrl = 'data:' . $mime . ';base64,' . base64_encode($binary);
      echo json_encode(array('success' => true, 'data_url' => $dataUrl));
    } else {
      echo json_encode(array('success' => true, 'data_url' => null));
    }
  } else {
    echo json_encode(array('success' => true, 'data_url' => null));
  }

  mysqli_close($link);
  exit;
}

if ($action === 'save') {
  $img = isset($_POST['img']) ? $_POST['img'] : '';
  if ($img === '') {
    echo json_encode(array('success' => false, 'error' => 'Formato de imagen no válido'));
    mysqli_close($link);
    exit;
  }

  if (!preg_match('/^data:(image\/png);base64,(.+)$/', $img, $matches)) {
    echo json_encode(array('success' => false, 'error' => 'Formato de imagen no válido'));
    mysqli_close($link);
    exit;
  }

  $mimeType = $matches[1];
  $encoded = $matches[2];
  $encoded = str_replace(' ', '+', $encoded);
  $binary = base64_decode($encoded, true);

  if ($binary === false) {
    echo json_encode(array('success' => false, 'error' => 'No se pudo decodificar la firma'));
    mysqli_close($link);
    exit;
  }

  if (strlen($binary) > 2 * 1024 * 1024) {
    echo json_encode(array('success' => false, 'error' => 'La firma supera el tamaño máximo permitido (2MB)'));
    mysqli_close($link);
    exit;
  }

  $stmt = mysqli_prepare($link, "INSERT INTO `informes_firmas` (`id_informe`, `mime_type`, `firma`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `mime_type` = VALUES(`mime_type`), `firma` = VALUES(`firma`), `updated_at` = CURRENT_TIMESTAMP");
  if (!$stmt) {
    echo json_encode(array('success' => false, 'error' => 'Error preparando guardado de firma: ' . mysqli_error($link)));
    mysqli_close($link);
    exit;
  }

  mysqli_stmt_bind_param($stmt, 'iss', $id_informe, $mimeType, $binary);
  $ok = mysqli_stmt_execute($stmt);
  if (!$ok) {
    echo json_encode(array('success' => false, 'error' => 'No se pudo guardar la firma: ' . mysqli_stmt_error($stmt)));
    mysqli_stmt_close($stmt);
    mysqli_close($link);
    exit;
  }
  mysqli_stmt_close($stmt);

  $dataUrl = 'data:' . $mimeType . ';base64,' . base64_encode($binary);
  echo json_encode(array('success' => true, 'data_url' => $dataUrl));
  mysqli_close($link);
  exit;
}

if ($action === 'delete') {
  $sql = "DELETE FROM `informes_firmas` WHERE `id_informe` = {$id_informe} LIMIT 1";
  $ok = mysqli_query($link, $sql);
  if (!$ok) {
    echo json_encode(array('success' => false, 'error' => 'No se pudo eliminar la firma: ' . mysqli_error($link)));
    mysqli_close($link);
    exit;
  }

  echo json_encode(array('success' => true));
  mysqli_close($link);
  exit;
}

echo json_encode(array('success' => false, 'error' => 'Acción no válida'));
mysqli_close($link);
exit;
?>
