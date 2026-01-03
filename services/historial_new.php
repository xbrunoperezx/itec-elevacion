<?php

include("conn_bbdd.php");

// Verifica si la conexión es exitosa
if (!$link) {
    die("Conexión fallida: " . mysqli_connect_error());
}

$id_cliente = isset($_POST['id_cliente']) ? intval($_POST['id_cliente']) : 0;
$comentario = isset($_POST['comentario']) ? mysqli_real_escape_string($link, trim($_POST['comentario'])) : '';

// intentar obtener id de usuario desde sesión (varios nombres posibles)
$id_usuario = 0;
$id_usuario = $_COOKIE['user_id'] ?? $id_usuario;
$id_usuario = intval($id_usuario);

if($id_cliente <= 0 || $id_usuario <= 0){
    echo 'ERROR: id_cliente inválido o id_usuario inválido';
    exit;
}
if($comentario === ''){
    echo 'ERROR: comentario vacío';
    exit;
}

$sql = "INSERT INTO clientes_historial (id_cliente, id_usuario, comentario) VALUES (%d, %d, '%s')";
$sql = sprintf($sql, $id_cliente, $id_usuario, $comentario);
$res = mysqli_query($link, $sql);
if($res){
    echo 'OK';
}else{
    echo 'ERROR: ' . mysqli_error($link);
}

?>