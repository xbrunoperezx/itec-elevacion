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

// Consulta para obtener la información de los formas de pago
$formaspago_sql = "SELECT * FROM formas_pago";
$formaspago_result = mysqli_query($link, $formaspago_sql);

// Inicialización de un array para almacenar los datos de los formas de pago
$formaspago = array();
// Bucle a través de cada fila de resultados de formas de pago y almacenamiento de datos en el array
while ($row = mysqli_fetch_assoc($formaspago_result)) {
    $formaspago[$row["id"]] = $row["forma_pago"];
}


// Consulta para obtener la información de las tarifas
$tarifas_sql = "SELECT * FROM tarifas";
$tarifas_result = mysqli_query($link, $tarifas_sql);

// Inicialización de un array para almacenar los datos de las tarifas
$tarifas = array();
// Bucle a través de cada fila de resultados de tarifas y almacenamiento de datos en el array
while ($row = mysqli_fetch_assoc($tarifas_result)) {
    $tarifas[$row["id"]] = $row["tarifa"];
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
        if (isset($formaspago[$row['id_formas_pago']])) {
        $row['forma_pago'] = $formaspago[$row['id_formas_pago']];
        }else{
        $row['forma_pago'] = "-";
        }
        if (isset($tarifas[$row['id_tarifas']])) {
        $row['tarifa'] = $tarifas[$row['id_tarifas']];
        }else{
        $row['tarifa'] = "-";
        }
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