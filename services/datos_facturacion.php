<?php

if(isset($_POST["filtro_id"])){
  $id = intval($_POST["filtro_id"]);
}else{
    $id = "";
}

include("conn_bbdd.php");

// Verifica si la conexión es exitosa
if (!$link) {
    die("Conexión fallida: " . mysqli_connect_error());
}

if($id!=""){
    // Define la consulta SQL
    $sql = "SELECT * FROM datos_facturacion WHERE id=$id ORDER BY id ASC";
    // Ejecuta la consulta
    $result = mysqli_query($link, $sql);

    // Inicialización de un array para almacenar los datos
    $resultados = array();

    // Bucle a través de cada fila de resultados y almacenamiento de datos en el array
    while ($row = mysqli_fetch_assoc($result)) {
        $resultados[] = $row;
    }

    // Cierre de la conexión a la base de datos
    mysqli_close($link);

    $retorno = array();
    // añadimos una línea al final con los mantenedores
    $retorno["resultados"] = $resultados;

    // Codificación del array de datos en formato JSON y envío como respuesta
    echo json_encode($retorno);
}else{
    echo "KO";
}

?>