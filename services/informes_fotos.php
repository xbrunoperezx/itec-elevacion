<?php
session_start();
header('Content-Type: application/json');

if (!isset($_COOKIE['user_id'])) {
  echo json_encode(array('success' => false, 'error' => 'KO: sesión ha expirado'));
  exit;
}

$action = isset($_POST['action']) ? $_POST['action'] : '';
$id_informe = isset($_POST['id_informe']) ? intval($_POST['id_informe']) : 0;

if ($id_informe <= 0) {
  echo json_encode(array('success' => false, 'error' => 'ID informe no válido'));
  exit;
}

$baseDir = realpath(__DIR__ . '/../uploads');
if ($baseDir === false) {
  $baseDir = __DIR__ . '/../uploads';
}

$informeDir = rtrim($baseDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'informes' . DIRECTORY_SEPARATOR . $id_informe;
$publicBase = 'uploads/informes/' . $id_informe . '/';

function ensureDir($dir)
{
  if (!is_dir($dir)) {
    return @mkdir($dir, 0775, true);
  }
  return true;
}

function jsonError($msg)
{
  echo json_encode(array('success' => false, 'error' => $msg));
  exit;
}

function listInformeFotos($informeDir, $publicBase)
{
  $result = array();
  if (!is_dir($informeDir)) {
    echo json_encode(array('success' => true, 'data' => $result));
    exit;
  }

  $files = glob($informeDir . DIRECTORY_SEPARATOR . '*.jpg');
  if (!$files) {
    echo json_encode(array('success' => true, 'data' => $result));
    exit;
  }

  usort($files, function ($a, $b) {
    return filemtime($b) - filemtime($a);
  });

  foreach ($files as $filePath) {
    $name = basename($filePath);
    $result[] = array(
      'name' => $name,
      'url' => $publicBase . rawurlencode($name) . '?t=' . filemtime($filePath),
      'size' => filesize($filePath),
      'updated_at' => date('Y-m-d H:i:s', filemtime($filePath))
    );
  }

  echo json_encode(array('success' => true, 'data' => $result));
  exit;
}

function getNextCounter($informeDir)
{
  $max = -1;
  if (!is_dir($informeDir)) {
    return 0;
  }
  $files = glob($informeDir . DIRECTORY_SEPARATOR . '*.jpg');
  if (!$files) {
    return 0;
  }
  foreach ($files as $f) {
    $name = basename($f);
    if (preg_match('/_(\d+)\.jpg$/i', $name, $m)) {
      $value = intval($m[1]);
      if ($value > $max) {
        $max = $value;
      }
    }
  }
  return $max + 1;
}

function applyExifOrientation($image, $tmpName)
{
  if (!function_exists('exif_read_data')) {
    return $image;
  }

  $exif = @exif_read_data($tmpName);
  if (!$exif || !isset($exif['Orientation'])) {
    return $image;
  }

  $orientation = intval($exif['Orientation']);
  switch ($orientation) {
    case 3:
      $rotated = imagerotate($image, 180, 0);
      if ($rotated !== false) {
        imagedestroy($image);
        return $rotated;
      }
      break;
    case 6:
      $rotated = imagerotate($image, -90, 0);
      if ($rotated !== false) {
        imagedestroy($image);
        return $rotated;
      }
      break;
    case 8:
      $rotated = imagerotate($image, 90, 0);
      if ($rotated !== false) {
        imagedestroy($image);
        return $rotated;
      }
      break;
  }

  return $image;
}

function compressAndSaveJpeg($tmpName, $destPath)
{
  $raw = @file_get_contents($tmpName);
  if ($raw === false) {
    return false;
  }

  $src = @imagecreatefromstring($raw);
  if ($src === false) {
    return false;
  }

  $src = applyExifOrientation($src, $tmpName);

  $srcW = imagesx($src);
  $srcH = imagesy($src);

  if ($srcW <= 0 || $srcH <= 0) {
    imagedestroy($src);
    return false;
  }

  $maxSide = 1920;
  $scale = min(1, $maxSide / max($srcW, $srcH));
  $dstW = max(1, (int)round($srcW * $scale));
  $dstH = max(1, (int)round($srcH * $scale));

  $dst = imagecreatetruecolor($dstW, $dstH);
  if ($dst === false) {
    imagedestroy($src);
    return false;
  }

  imagealphablending($dst, true);
  $white = imagecolorallocate($dst, 255, 255, 255);
  imagefilledrectangle($dst, 0, 0, $dstW, $dstH, $white);

  if (!imagecopyresampled($dst, $src, 0, 0, 0, 0, $dstW, $dstH, $srcW, $srcH)) {
    imagedestroy($src);
    imagedestroy($dst);
    return false;
  }

  $ok = imagejpeg($dst, $destPath, 78);

  imagedestroy($src);
  imagedestroy($dst);

  return $ok;
}

function normalizeFilesArray($files)
{
  $normalized = array();

  if (!isset($files['name'])) {
    return $normalized;
  }

  if (is_array($files['name'])) {
    $count = count($files['name']);
    for ($i = 0; $i < $count; $i++) {
      $normalized[] = array(
        'name' => $files['name'][$i],
        'type' => isset($files['type'][$i]) ? $files['type'][$i] : '',
        'tmp_name' => isset($files['tmp_name'][$i]) ? $files['tmp_name'][$i] : '',
        'error' => isset($files['error'][$i]) ? $files['error'][$i] : UPLOAD_ERR_NO_FILE,
        'size' => isset($files['size'][$i]) ? $files['size'][$i] : 0
      );
    }
  } else {
    $normalized[] = $files;
  }

  return $normalized;
}

if ($action === 'list') {
  listInformeFotos($informeDir, $publicBase);
}

if ($action === 'upload') {
  if (!ensureDir($informeDir)) {
    jsonError('No se pudo crear el directorio de fotos del informe');
  }

  if (!function_exists('imagecreatefromstring')) {
    jsonError('La extensión GD no está habilitada en el servidor');
  }

  if (!isset($_FILES['fotos'])) {
    jsonError('No se recibieron archivos');
  }

  $files = normalizeFilesArray($_FILES['fotos']);
  if (empty($files)) {
    jsonError('No se recibieron archivos válidos');
  }

  $dt = new DateTime('now');
  $datePart = $dt->format('Y-m-d_H-i-s');
  $counter = getNextCounter($informeDir);

  $uploaded = array();
  foreach ($files as $f) {
    if (!isset($f['error']) || intval($f['error']) !== UPLOAD_ERR_OK) {
      continue;
    }

    if (!isset($f['tmp_name']) || !is_uploaded_file($f['tmp_name'])) {
      continue;
    }

    if (!isset($f['size']) || intval($f['size']) <= 0) {
      continue;
    }

    if (intval($f['size']) > 15 * 1024 * 1024) {
      continue;
    }

    $counterLocal = $counter;
    $filename = 'inf' . $id_informe . '-' . $datePart . '_' . $counterLocal . '.jpg';
    $destPath = $informeDir . DIRECTORY_SEPARATOR . $filename;

    while (file_exists($destPath)) {
      $counterLocal++;
      $filename = 'inf' . $id_informe . '-' . $datePart . '_' . $counterLocal . '.jpg';
      $destPath = $informeDir . DIRECTORY_SEPARATOR . $filename;
    }

    if (!compressAndSaveJpeg($f['tmp_name'], $destPath)) {
      continue;
    }

    @chmod($destPath, 0664);

    $uploaded[] = array(
      'name' => $filename,
      'url' => $publicBase . rawurlencode($filename) . '?t=' . filemtime($destPath),
      'size' => filesize($destPath),
      'updated_at' => date('Y-m-d H:i:s', filemtime($destPath))
    );

    $counter = $counterLocal + 1;
  }

  echo json_encode(array('success' => true, 'uploaded' => $uploaded));
  exit;
}

if ($action === 'delete') {
  $filename = isset($_POST['filename']) ? basename($_POST['filename']) : '';
  if ($filename === '' || !preg_match('/\.jpg$/i', $filename)) {
    jsonError('Nombre de archivo no válido');
  }

  $target = $informeDir . DIRECTORY_SEPARATOR . $filename;
  if (is_file($target)) {
    if (!@unlink($target)) {
      jsonError('No se pudo eliminar la foto');
    }
  }

  echo json_encode(array('success' => true));
  exit;
}

if ($action === 'delete_all_by_informe') {
  if (is_dir($informeDir)) {
    $files = glob($informeDir . DIRECTORY_SEPARATOR . '*');
    if ($files) {
      foreach ($files as $f) {
        if (is_file($f)) {
          @unlink($f);
        }
      }
    }
    @rmdir($informeDir);
  }

  echo json_encode(array('success' => true));
  exit;
}

jsonError('Acción no válida');
