<?php

// Comprobar cookie de sesión 'user_id'
if (!isset($_COOKIE['user_id'])) {
    echo "KO: sesión ha expirado";
    exit;
}

$id = isset($_POST['id']) ? $_POST['id'] : '';
$id_cliente = isset($_POST['id_cliente']) ? $_POST['id_cliente'] : '';
$fecha = isset($_POST['fecha']) ? $_POST['fecha'] : '';
$id_usuarios = isset($_COOKIE['user_id']) ? $_COOKIE['user_id'] : (isset($_POST['id_usuarios']) ? $_POST['id_usuarios'] : '');
$tipo = isset($_POST['tipo']) ? $_POST['tipo'] : '';
$estado = isset($_POST['estado']) ? $_POST['estado'] : '';
$num_control = isset($_POST['num_control']) ? $_POST['num_control'] : '';
$observaciones = isset($_POST['observaciones']) ? $_POST['observaciones'] : '';
$nocobrar = isset($_POST['nocobrar']) ? $_POST['nocobrar'] : '';
$precio = isset($_POST['precio']) ? $_POST['precio'] : '';
$id_formas_pago = isset($_POST['id_formas_pago']) ? $_POST['id_formas_pago'] : '';
$id_tarifa = isset($_POST['id_tarifa']) ? $_POST['id_tarifa'] : '';
$comunicada = isset($_POST['comunicada']) ? $_POST['comunicada'] : '';
$enviada_cobrar = isset($_POST['enviada_cobrar']) ? $_POST['enviada_cobrar'] : '';
$comunicada_aquien = isset($_POST['comunicada_aquien']) ? $_POST['comunicada_aquien'] : '';
$comunicada_como = isset($_POST['comunicada_como']) ? $_POST['comunicada_como'] : '';
$contratada_como = isset($_POST['contratada_como']) ? $_POST['contratada_como'] : '';

include("conn_bbdd.php");

// Verifica si la conexión es exitosa
if (!$link) {
    die("Conexión fallida: " . mysqli_connect_error());
}

// Normalizar fechas: usar '0000-00-00' si vacío
$fecha_val = ($fecha === '' || $fecha === null) ? '0000-00-00' : $fecha;
$comunicada_val = ($comunicada === '' || $comunicada === null) ? '0000-00-00' : $comunicada;
$enviada_cobrar_val = ($enviada_cobrar === '' || $enviada_cobrar === null) ? '0000-00-00' : $enviada_cobrar;

// Si se proporciona un id no vacío, hacemos UPDATE, si no hacemos INSERT
if(isset($_POST['id']) && $_POST['id'] !== ''){
    $sql = "UPDATE contratadas SET id_cliente='{$id_cliente}', fecha='{$fecha_val}', id_usuarios='{$id_usuarios}', tipo='{$tipo}', estado='{$estado}', num_control='{$num_control}', observaciones='{$observaciones}', nocobrar='{$nocobrar}', precio='{$precio}', id_formas_pago='{$id_formas_pago}', id_tarifa='{$id_tarifa}', comunicada='{$comunicada_val}', enviada_cobrar='{$enviada_cobrar_val}', comunicada_aquien='{$comunicada_aquien}', comunicada_como='{$comunicada_como}', contratada_como='{$contratada_como}' WHERE id='{$id}'";

    if (mysqli_query($link, $sql)) {
        echo "OK";
    } else {
        echo "Error al actualizar contratada: " . mysqli_error($link);
    }
}else{
    // Preparar valores por defecto para la inserción
    // Usar la fecha actual para nuevas contratadas
    $fecha_ins = date('Y-m-d');
    
    $sql = "INSERT INTO contratadas (id_cliente,fecha,id_usuarios,estado,num_control) VALUES ('{$id_cliente}','{$fecha_ins}','{$id_usuarios}',0,0)";

    if (mysqli_query($link, $sql)) {
        echo "OK";
    } else {
        echo "Error al insertar contratada: " . mysqli_error($link);
    }
}

// Cierre de la conexión a la base de datos
mysqli_close($link);

?>
