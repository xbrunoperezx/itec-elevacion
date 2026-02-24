<?php

//comprobamos la cookie de sesion
if(!isset($_COOKIE['user_id'])){
    echo "KO: sesion ha expirado";
    exit;
}

include("conn_bbdd.php");

//$link es variable asignada a la conexion a la DB en conn_bbdd.php
if(!$link){
    die("conexion fallida:" . mysqli_connect_error());
}

//Action variable de accion solicitada
$action= isset($_POST['action']) ? $_POST['action'] : '';

switch($action){
    case 'list':
        //paso 1: leer el numero de resigstros a listar (por defecto  15)
        $limite= isset($_POST['filtro_tarifas_total']) ? intval($_POST['filtro_tarifas_total']) : 15;

        //paso 2: leer el filtro de busqueda por nombre de la tarifa
        $filtro_tarifa= isset($_POST['filtro_tarifa']) ? mysqli_real_escape_string($link, $_POST['filtro_tarifa']) : '';

        //paso3: construir la consulta SQL
        $sql= "SELECT * FROM tarifas ";
        if(!empty($filtro_tarifa)) {
            $sql .= "WHERE tarifa LIKE '%$filtro_tarifa%' ";
        }
        $sql .="ORDER BY id ASC LIMIT $limite";

        //paso 4: ejecutar la consulta mysql
        $resultado= mysqli_query($link, $sql);

        //paso 5: recorrer los resultados y los guardamos en un array
        $tarifas= array();
        if($resultado) {
            while($fila= mysqli_fetch_assoc($resultado)) {
                $tarifas[] = $fila;
            }
        }

        //paso 6: devolver los resultados en formato json para que se peudan leer
        echo json_encode(['resultados' => $tarifas]);
        break;

    case 'create':
        //aqui ira cdoigo para crear
        break;

    case 'update':
        //aqui ira codigo para actualizar
        break;

    case 'delete':
        //aqui uira codigo para eliminar
        break;

    default:
        echo "KO: acción no valida";
        break;
}

?>