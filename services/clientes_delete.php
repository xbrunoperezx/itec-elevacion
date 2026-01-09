<?php
include("conn_bbdd.php");

// respuesta por defecto
$response = array(
    "success" => false,
    "message" => "Error desconocido"

);
    


// comprobamos que nos llega el ID
if (!isset($_POST['id'])){
    $response ["message"]= "ID no recibido";
    echo json_encode($response);
    exit;
}

//convertimos el ID a  nuemro entero (Seguridad)
$id= intval($_POST['id']); // seguridad basica evita injeccion SQL y grantiza que sea un numero el que busca

// la consulta query donde se borra el cliente
$sql= "DELETE FROM clientes WHERE id= $id";


// ejecutamos al consulta query
if(mysqli_query($link, $sql)) {
    $response["success"] = true;
    $response["message"] = "Cliente eliminado correctamente";
} else {
    $response["messagge"] = "Error al eliminar cliente";
}

// cerramos la conexion con la DB
mysqli_close($link);


//Respondemos al frontend
echo json_encode($response);



