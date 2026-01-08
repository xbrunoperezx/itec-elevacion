<?php

// Comprobar cookie de sesión 'user_id'
if (!isset($_COOKIE['user_id'])) {
    echo "KO: sesión ha expirado";
    exit;
}

if(isset($_POST["filtro_total"])){
    $lim = $_POST["filtro_total"];
}else{
    $lim = 15;
}

if(isset($_POST["filtro_id"])){
  $id = $_POST["filtro_id"];
}else{
    $id = "";
}

// filtro por id_cliente en contratadas
if(isset($_POST["filtro_id_cliente"])){
    $filtro_id_cliente = intval($_POST["filtro_id_cliente"]);
}else{
    $filtro_id_cliente = "";
}

include("conn_bbdd.php");
// $link = mysqli_connect("89.46.111.188", "Sql1396152", "5i4w182228", "Sql1396152_2");
// mysqli_query($link, "SET SESSION sql_mode='ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'");
// mysqli_set_charset($link,"utf8");

// Verifica si la conexión es exitosa
if (!$link) {
    die("Conexión fallida: " . mysqli_connect_error());
}

// Consulta para obtener la información de los mantenedores
    $mantenedores_sql = "SELECT * FROM mantenedores";
    $mantenedores_result = mysqli_query($link, $mantenedores_sql);
    // Inicialización de un array para almacenar los datos de los mantenedores
    $mantenedores = array();
    // Bucle a través de cada fila de resultados de mantenedores y almacenamiento de datos en el array
    while ($row = mysqli_fetch_assoc($mantenedores_result)) {
        $mantenedores[$row["id"]] = $row["mantenedor"];
    }

// Consulta para obtener la información de las formas de pago
    $formas_pago_sql = "SELECT * FROM formas_pago";
    $formas_pago_result = mysqli_query($link, $formas_pago_sql);
    // Inicialización de un array para almacenar los datos de las formas de pago
    $formas_pago = array();
    // Bucle a través de cada fila de resultados de las formas de pago y almacenamiento de datos en el array
    while ($row = mysqli_fetch_assoc($formas_pago_result)) {
        $formas_pago[$row["id"]] = $row["forma_pago"];
    }

// Consulta para obtener la información de los usuarios
    $usuarios_sql = "SELECT * FROM usuarios";
    $usuarios_result = mysqli_query($link, $usuarios_sql);
    // Inicialización de un array para almacenar los datos de los usuarios
    $usuarios = array();
    // Bucle a través de cada fila de resultados de usuarios y almacenamiento de datos en el array
    while ($row = mysqli_fetch_assoc($usuarios_result)) {
        $usuarios[$row["id"]] = $row["name"];
    }

// Si viene filtro por id_cliente, filtrar por con.id_cliente
if($filtro_id_cliente!=""){
    $sql = "SELECT c.*, con.id AS con_id, con.fecha, con.id_usuarios, con.estado, con.num_control, con.observaciones AS con_observaciones, con.nocobrar, con.precio, con.id_formas_pago AS con_id_formas_pago, con.id_tarifa AS con_id_tarifa, con.comunicada, con.enviada_cobrar, con.comunicada_aquien, con.comunicada_como, con.contratada_como FROM clientes c JOIN contratadas con ON c.id = con.id_cliente WHERE con.id_cliente=" . $filtro_id_cliente;
}else if($id==""){
    // Define la consulta SQL
    $sql = "SELECT c.*, con.id AS con_id, con.fecha, con.id_usuarios, con.estado, con.num_control, con.observaciones AS con_observaciones, con.nocobrar, con.precio, con.id_formas_pago AS con_id_formas_pago, con.id_tarifa AS con_id_tarifa, con.comunicada, con.enviada_cobrar, con.comunicada_aquien, con.comunicada_como, con.contratada_como FROM clientes c JOIN contratadas con ON c.id = con.id_cliente";

    $where = array();
    if (!empty($_POST['filtro_rae'])) {
        $where[] = "c.rae LIKE '%{$_POST['filtro_rae']}%'";
    }
    if (!empty($_POST['filtro_direccion'])) {
        $where[] = "c.direccion LIKE '%{$_POST['filtro_direccion']}%'";
    }
    if (!empty($_POST['filtro_localidad'])) {
        $where[] = "c.localidad LIKE '%{$_POST['filtro_localidad']}%'";
    }
    if (!empty($_POST['filtro_nombre'])) {
        $where[] = "c.nombre LIKE '%{$_POST['filtro_nombre']}%'";
    }
    if (!empty($_POST['filtro_fecha_inicio'])) {
        $where[] = "c.vencimiento >= '{$_POST['filtro_fecha_inicio']}'";
    }
    if (!empty($_POST['filtro_fecha_fin'])) {
        $where[] = "c.vencimiento <= '{$_POST['filtro_fecha_fin']}'";
    }
    if (count($where) > 0) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY id DESC LIMIT 0,{$lim}";
}else{
    $sql = "SELECT c.*, con.id AS con_id, con.fecha, con.id_usuarios, con.estado, con.num_control, con.observaciones AS con_observaciones, con.nocobrar, con.precio, con.id_formas_pago AS con_id_formas_pago, con.id_tarifa AS con_id_tarifa, con.comunicada, con.enviada_cobrar, con.comunicada_aquien, con.comunicada_como, con.contratada_como FROM clientes c JOIN contratadas con ON c.id = con.id_cliente WHERE con.id=$id";
}

// Ejecuta la consulta
$result = mysqli_query($link, $sql);

if (!$result) {
die("Consulta fallida: " . mysqli_error($link));
}

// Inicialización de un array para almacenar los datos
$resultados = array();

// Bucle a través de cada fila de resultados y almacenamiento de datos en el array
while ($row = mysqli_fetch_assoc($result)) {
    $cliente = array();
    foreach (array_keys($row) as $key) {
        if (in_array($key, ["id","rae","nombre","direccion","localidad","municipio","cp","provincia","id_campo","id_mantenedor","id_administrador","quien_contrata","telefono","telefono2","email","tiene_datos","id_tarifa","id_formas_pago","vencimiento","cada","contratada","observaciones"])) {
            if($key=="id_mantenedor"){
                if(isset($mantenedores[$row[$key]])){
                    $cliente['mantenedor'] = $mantenedores[$row[$key]];
                }else{
                    $cliente['mantenedor'] = "-";
                    $row[$key] = "-";
                }
            }
            if($key=="vencimiento"){
                if($row[$key]!="0000-00-00" AND $row[$key]!="" AND $row[$key]!=null){
                    $row[$key] = date("d-m-Y", strtotime($row[$key]));
                }else{
                    $row[$key] = "-";
                }
            }
            $cliente[$key] = $row[$key];
        }
    }
    $contratada = array();
    foreach (array_keys($row) as $key) {
        if (in_array($key, ["con_id","id_cliente","fecha","id_usuarios","estado","num_control","con_observaciones","nocobrar","precio","con_id_formas_pago","con_id_tarifa","comunicada","enviada_cobrar","comunicada_aquien","comunicada_como","contratada_como"])) {
            if($key=="comunicada"){
                if($row[$key]!="0000-00-00" AND $row[$key]!="" AND $row[$key]!=null){
                    $row[$key] = $row[$key];
                    $contratada["comunicada_dmy"] = date("d-m-Y", strtotime($row[$key]));
                }else{
                    $row[$key] = "-";
                    $contratada["comunicada_dmy"] = "-";
                }
            }
            if($key=="id_usuarios"){
                // Mantener el id numérico en 'id_usuarios', pero añadir el nombre en 'usuario'
                $usuario_nombre = (isset($usuarios[$row[$key]]) && $usuarios[$row[$key]] != null) ? $usuarios[$row[$key]] : '-';
                $contratada['usuario'] = $usuario_nombre;
            }
            $contratada[$key] = $row[$key];
        }
    }
    $resultado = array();
    $resultado["cliente"] = $cliente;
    $resultado["cliente"]["contratada"] = $contratada;
    $resultados[] = $resultado;
}

// Cierre de la conexión a la base de datos
mysqli_close($link);

$retorno = array();
// añadimos una línea al final con los mantenedores
$retorno["resultados"] = $resultados;
$retorno["formas_pago"] = $formas_pago;

// Codificación del array de datos en formato JSON y envío como respuesta
echo json_encode($retorno);

?>