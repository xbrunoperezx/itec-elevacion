<?php
header('Content-Type: text/plain');
require_once 'conn_bbdd.php';
session_start();

$id_cliente = isset($_POST['id_cliente']) ? intval($_POST['id_cliente']) : 0;
$comentario = isset($_POST['comentario']) ? mysqli_real_escape_string($conn, trim($_POST['comentario'])) : '';

// intentar obtener id de usuario desde sesión (varios nombres posibles)
$id_usuario = 0;
if(isset($_SESSION['id_usuario'])) $id_usuario = intval($_SESSION['id_usuario']);
elseif(isset($_SESSION['user_id'])) $id_usuario = intval($_SESSION['user_id']);
elseif(isset($_SESSION['id'])) $id_usuario = intval($_SESSION['id']);

if($id_cliente <= 0){
    echo 'ERROR: id_cliente inválido';
    exit;
}
if($comentario === ''){
    echo 'ERROR: comentario vacío';
    exit;
}

$sql = "INSERT INTO historial (id_cliente, id_usuario, comentario) VALUES (%d, %d, '%s')";
$sql = sprintf($sql, $id_cliente, $id_usuario, $comentario);
$res = mysqli_query($conn, $sql);
if($res){
    echo 'OK';
}else{
    echo 'ERROR: ' . mysqli_error($conn);
}

?>