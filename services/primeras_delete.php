<?php

// Comprobar cookie de sesión 'user_id'
if (!isset($_COOKIE['user_id'])) {
    echo "KO: sesión ha expirado";
    exit;
}

if(isset($_POST['id'])){
    $id = intval($_POST['id']);
}else{
    echo "KO";
    exit;
}

if($id <= 0){
    echo "KO";
    exit;
}

include("conn_bbdd.php");

if (!$link) {
    echo "ERROR: no connection";
    exit;
}

// Eliminar datos asociados al informe antes de eliminar la cabecera.
mysqli_query($link, "DELETE FROM `informes_mediciones` WHERE `id_informe` = {$id}");
mysqli_query($link, "DELETE FROM `informes_equipos` WHERE `id_informe` = {$id}");
mysqli_query($link, "DELETE FROM `informes_firmas` WHERE `id_informe` = {$id}");

// Si existe relación en contratadas con el informe, se limpia para evitar referencias huérfanas.
mysqli_query($link, "UPDATE `contratadas` SET `id_informe` = 0 WHERE `id_informe` = {$id}");

$sql = "DELETE FROM `informes` WHERE `id` = {$id} LIMIT 1";
if(mysqli_query($link, $sql)){
    echo "OK";
}else{
    echo "ERROR: " . mysqli_error($link);
}

mysqli_close($link);

?>
