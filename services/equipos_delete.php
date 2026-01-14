<?php

// Comprobar cookie de sesión 'user_id'
if (!isset($_COOKIE['user_id'])) {
    echo "KO: sesión ha expirado";
    exit;
}
// Elimina un registro de equipos por id
if(isset($_POST['id'])){
    $id = intval($_POST['id']);
}else{
    echo "KO";
    exit;
}

include("conn_bbdd.php");

if (!$link) {
    echo "ERROR: no connection";
    exit;
}

$sql = "DELETE FROM equipos WHERE id={$id} LIMIT 1";
if(mysqli_query($link, $sql)){
    echo "OK";
}else{
    echo "ERROR: " . mysqli_error($link);
}

mysqli_close($link);

?>
