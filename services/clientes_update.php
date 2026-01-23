<?php
include("conn_bbdd.php");


// respuesta por defecto
$response= array(
    "success" => false,
    "message" => "Error desconocido"

);

//comprobamos que no falte nada de los formularios
if(
    !isset($_POST['id']) ||
    !isset($_POST['nombre']) ||
    !isset($_POST['direccion']) ||
    !isset($_POST['localidad']) ||
    !isset($_POST['cp']) ||
    !isset($_POST['id_mantenedor'])
    
) {
    $response['message'] = "Datos incompletos";
    echo json_encode($response); // si falta algo enviamos mensaje formato json a ajax
    exit;
}

//comprobamos que el id sea numerico
$id= intval($_POST['id']);

//para seguridad  escapa comillas o que se introduca ' OR 1=1
$nombre= mysqli_real_escape_string($link, $_POST['nombre']);
$direccion= mysqli_real_escape_string($link, $_POST['direccion']);
$localidad= mysqli_real_escape_string($link, $_POST['localidad']);
$cp= mysqli_real_escape_string($link, $_POST['cp']) ;
$id_mantenedor= (int)$_POST['id_mantenedor'];
$vencimiento= empty($_POST['vencimiento'])
    ? "NULL"
    : "'" . mysqli_real_escape_string($link, $_POST['vencimiento']) . "'";
$contratada= isset($_POST['contratada']) && $_POST['contratada'] == 1 ? 1 : 0;     


// consulta que dice: "Actualiza este cliente(id) con estos nuevos datos 
$sql= "
    UPDATE clientes
    Set nombre='$nombre',
        direccion='$direccion',
        localidad='$localidad',
        cp='$cp',
        id_mantenedor=$id_mantenedor,
        vencimiento= $vencimiento,
        contratada= $contratada
    WHERE id=$id    
";

 
//ecutamos la query/consulta  si todo va bien el cliente se actualiza y js recibe success: true si no da el error
if(mysqli_query($link, $sql)) {
    $response["success"]= true;
    $response["message"]= "Cliente actualizado correctamente";
} else {
    $response["message"]= "Error al actualizar cliente";
}


mysqli_close($link);
echo json_encode($response);
