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
    empty($_POST['municipio']) ||
    empty($_POST['mantenedor']) ||
    empty($_POST['cp'])
) {
    $response['message'] = "Todos los campos son obligatorios";
    echo json_encode($response);
    exit;
}

//seguridad basica 
$nombre= mysqli_real_escape_string($link, $_POST['nombre']);
$direccion= mysqli_real_escape_string($link, $_POST['direccion']);
$localidad= mysqli_real_escape_string($link, $_POST['localidad']);
$municipio= mysqli_real_escape_string($link, $_POST['municipio']);
$mantenedor= mysqli_real_escape_string($link, $_POST['mantenedor']);
$cp= mysqli_real_escape_string($link, $_POST['cp']);


//la consulta de INSERT para nuevo cliente
$sql= "
    INSERT INTO clientes(nombre, direccion, localidad, municipio, cp, id_mantenedor)
    VALUES('$nombre', '$direccion', '$localidad', '$municipio' ,'$cp', $id_mantenedor)

";

//ejecutamos la query/consulta  si todo va bien el cliente se actualiza y js recibe success: true si no da el error
if(mysqli_query($link, $sql)){

    //nuevo cliente
    $idNuevo= mysqli_insert_id($link);

    $response['success']= true;
    $response['message']= "Cliente creado correctamente";

    //devolvemos el cliente completo al front (Los datos del nuevo cliente creado)
    $response['cliente']= array(
        "id"=> $idNuevo,
        "nombre"=> $nombre,
        "direccion"=> $direccion,
        "localidad"=> $localidad,
        "municipio"=> $municipio,
        "mantenedor"=> $mantenedor,
        "cp"=> $cp
    );
} else {
    $response['message']= "Error al crear cliente";
}

//cerramos conexion
mysqli_close($link);

//respondemos al front
echo json_encode($response);
