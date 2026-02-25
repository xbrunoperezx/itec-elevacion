<?php
//PROPOSITO DE ESTE ARCHIVO TARIFAS.PHP!!
//-Consultar la abse de datos para obtener la lista de tarifas segun los filtros enviados desde el front

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
        //ordena por Id y limita el numero de registros
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

        //paso 6: devolver los resultados del array en formato JSON para que se puedan leer
        echo json_encode(['resultados' => $tarifas]);
        break;

    case 'create':
        //leeremos los datos enviados desd eel front; usaremos $_POST para obtener los valores de 'tarifa' y 'precio' enviados por el form
        //mmysqli_real_escape_string limpia el texto para evitar inyecciones sql
        $tarifa = isset($_POST['tarifa']) ? mysqli_real_escape_string($link, $_POST['tarifa']) : '';
        //floatval convierte el precio a un numero decimal
        $precio = isset($_POST['precio']) ? floatval($_POST['precio']) : 0;

        //verificamos que el nombre de la tarifa no este vacio y que el precio sea mayor que 0
        if (empty($tarifa) || $precio <= 0) {
            echo "KO: Datos inválidos";
            exit;
        }

        //construir la consulta SQL para insertar
        // Creamos una consulta SQL para insertar una nueva fila en la tabla 'tarifas'.
        // Especificamos las columnas 'tarifa' y 'precio' y sus valores correspondientes.
        $sql = "INSERT INTO tarifas (tarifa, precio) VALUES ('$tarifa', $precio)";

        // Ejecutar la consulta Usamos mysqli_query para ejecutar la consulta en la base de datos.
        // Si la consulta se ejecuta correctamente, devolvemos un mensaje de éxito.
        // Si ocurre un error, devolvemos un mensaje de error con el detalle del problema.
        if (mysqli_query($link, $sql)) {
            echo "OK: tarifa creada correctamente";
        } else {
            echo "KO: error al crear tarifa: " . mysqli_error($link);
        }

        
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