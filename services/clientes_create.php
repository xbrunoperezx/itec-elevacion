<?php
include("conn_bbdd.php");

$response = array (
    "success" => false,
    "message" => "Error de desconocida"
);

//validacion 
if (
    empty($_POST['nombre']) ||
    empty($_POST['direccion']) ||
    empty($_POST['localidad']) ||
    empty($_POST['cp'])
) {
    $response['message'] = "Todos los campos son obligatorios",
    echo json_encode($response);
    exit;
}

//seguridad basica 
$nombre= mysqli_real_escape_string($link, $_POST['nombre']);
$direccion= mysqli_real_escape_string($link, $_POST['direccion']);
$localidad= mysqli_real_escape_string($link, $_POST['localidad']);
$cp= mysqli_real_escape_string($link, $_POST['cp']);


//la consulta de INSERT para nuevo cliente
$sql= "
    INSERT INTO clientes(nombre, direccion, localidad, cp)
    VALUES('$nombre', '$direccion', '$localidad', '$cp')

";

//ejecutamos la query/consulta  si todo va bien el cliente se actualiza y js recibe success: true si no da el error
if(mysqli_query($link, $sql)){
    $response['success']= true;
    $response['message']= "Cliente creado correctamente";
} else {
    $response['message']= "Error al crear cliente";
}

//cerramos conexion
mysqli_close($link);

//respondemos al front
echo json_encode($response);
