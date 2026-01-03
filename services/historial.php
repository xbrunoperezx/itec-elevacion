<?php

$lim = isset($_POST['filtro_total']) ? intval($_POST['filtro_total']) : 100;
$filtro_id = 0;
if(isset($_POST['filtro_id_cliente'])){
    $filtro_id = intval($_POST['filtro_id_cliente']);
} elseif(isset($_POST['filtro_id'])){
    $filtro_id = intval($_POST['filtro_id']);
}

if($filtro_id <= 0){
    echo json_encode(['resultados' => []]);
    exit;
}

include("conn_bbdd.php");

// Verifica si la conexión es exitosa
if (!$link) {
    die("Conexión fallida: " . mysqli_connect_error());
}

// Consulta para obtener la información de los usuarios
$usuarios_sql = "SELECT * FROM usuarios";
$usuarios_result = mysqli_query($link, $usuarios_sql);

// Inicialización de un array para almacenar los datos de los usuarios
$usuarios = array();

// Bucle a través de cada fila de resultados de usuarios y almacenamiento de datos en el array
while ($row = mysqli_fetch_assoc($usuarios_result)) {
    $usuarios[$row["id"]] = $row["user"];
}

$sql = "SELECT * FROM clientes_historial WHERE id_cliente = %d ORDER BY id DESC LIMIT %d";
$sql = sprintf($sql, $filtro_id, $lim);
$res = mysqli_query($link, $sql);
$resultados = array();
if($res){
    while($row = mysqli_fetch_assoc($res)){
        if (isset($usuarios[$row['id_usuario']])) {
            $row['usuario'] = $usuarios[$row['id_usuario']];
        }else{
            $row['usuario'] = "-";
        }
        $resultados[] = $row;
    }
}

echo json_encode(['resultados' => $resultados]);

?>