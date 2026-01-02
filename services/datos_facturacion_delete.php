<?php
// Elimina un registro de datos_facturacion por id
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

$sql = "DELETE FROM datos_facturacion WHERE id={$id} LIMIT 1";
if(mysqli_query($link, $sql)){
    echo "OK";
}else{
    echo "ERROR: " . mysqli_error($link);
}

mysqli_close($link);

?>
