<?php
include("conn_bbdd.php");

$response= [
    "success" => false,
    "message" => "Error desconocido"
];

if (!isset($_POST['id'])){
    $response= ["message"]= "ID no recibido";
    echo json_encode($response);
    exit;
}

$id= intval($_POST['id']); // seguridad basica

$sql= "DELETE FROM clientes WHERE id= $id";

if(mysqli_query($link, $sql)) {
    $response= ["success"] = true;
    $response= ["message"] = "Cliente eliminado correctamente";
} else {
    $response= ["messagge"] ="Error al eliminar cliente";
}

mysqli_close($link);

echo json_encode($response);



