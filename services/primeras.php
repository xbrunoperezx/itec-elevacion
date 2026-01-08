<?php

// Initialize expected POST variables with safe defaults to avoid undefined index notices
$__post_defaults = [
  'filtro_total' => 15,
  'filtro_id' => '',
  'filtro_direccion' => '',
  'filtro_nombre' => '',
  'filtro_rae' => '',
  'filtro_localidad' => '',
  'filtro_fecha_inicio' => '',
  'filtro_fecha_fin' => '',
  'filtro_pendientes' => 'false'
];
foreach ($__post_defaults as $k => $v) {
  if (!isset($_POST[$k])) {
    $_POST[$k] = $v;
  }
}

$lim = $_POST["filtro_total"];
$id = intval($_POST["filtro_id"]);

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

// Consulta para obtener la información de los usuarios
    $usuarios_sql = "SELECT * FROM usuarios";
    $usuarios_result = mysqli_query($link, $usuarios_sql);
    // Inicialización de un array para almacenar los datos de los usuarios
    $usuarios = array();
    // Bucle a través de cada fila de resultados de usuarios y almacenamiento de datos en el array
    while ($row = mysqli_fetch_assoc($usuarios_result)) {
        $usuarios[$row["id"]] = $row["abrev"]."-".$row["name"];
    }

// Columnas usadas en las consultas (definidas aquí para usarlas en ambos casos)
$columnas = array('inf.*','cli.id AS cli_id','cli.rae','cli.nombre','cli.direccion','cli.localidad','cli.municipio','cli.cp','cli.provincia','cli.id_campo','cli.id_mantenedor','cli.id_administrador','cli.quien_contrata','cli.telefono','cli.telefono2','cli.email','cli.tiene_datos','cli.vencimiento','cli.cada','cli.contratada','cli.observaciones AS cli_observaciones','con.id AS con_id','con.id_cliente','con.fecha AS con_fecha','con.id_usuarios','con.estado AS con_estado','con.num_control','con.observaciones AS con_observaciones','con.nocobrar','con.enviada_cobrar');

$columnas = implode(',', $columnas);

if($id <= 0){
  $filters = [
    'filtro_direccion' => [
      'column' => 'cli.direccion',
      'value' => "%".$_POST['filtro_direccion']."%",
      'operator' => 'LIKE'
    ],
    'filtro_nombre' => [
      'column' => 'cli.nombre',
      'value' => "%".$_POST['filtro_nombre']."%",
      'operator' => 'LIKE'
    ],
    'filtro_rae' => [
      'column' => 'cli.rae',
      'value' => "%".$_POST['filtro_rae']."%",
      'operator' => 'LIKE'
    ],
    'filtro_localidad' => [
      'column' => 'cli.localidad',
      'value' => "%".$_POST['filtro_localidad']."%",
      'operator' => 'LIKE'
    ],
    'filtro_fecha_inicio' => [
      'column' => 'inf.fecha',
      'value' => $_POST['filtro_fecha_inicio'],
      'operator' => '>='
    ],
    'filtro_fecha_fin' => [
      'column' => 'inf.fecha',
      'value' => $_POST['filtro_fecha_fin'],
      'operator' => '<='
    ]
  ];

  $where = [];
  foreach ($filters as $key => $filter) {
    if (!empty($filter['value']) && $filter['value']!="%%") {
      $where[] = "{$filter['column']} {$filter['operator']} '{$filter['value']}'";
    }
  }
  $where_clause = '';
  if (count($where) > 0) {
    $where_clause = ' WHERE ' . implode(' AND ', $where);
  }
  if($_POST['filtro_pendientes']=="true"){
    if($where_clause==''){
      $where_clause = ' WHERE resultado=0';
    }else{
      $where_clause .= ' AND resultado=0';
    }
  }
  $sql = "SELECT {$columnas} FROM informes inf";
  $sql.= " JOIN contratadas con ON inf.id_contratada = con.id";
  $sql.= " JOIN clientes cli ON con.id_cliente = cli.id".$where_clause;
  $sql.= " ORDER BY inf.fecha DESC LIMIT 0,{$lim}";
}else{
  // Usar las mismas joins para obtener la estructura completa cuando se solicita por id
  $sql = "SELECT {$columnas} FROM informes inf";
  $sql.= " JOIN contratadas con ON inf.id_contratada = con.id";
  $sql.= " JOIN clientes cli ON con.id_cliente = cli.id WHERE inf.id = {$id}";
}

// Ejecuta la consulta
$result = mysqli_query($link, $sql);
// Comprobar errores en la consulta y devolver información útil para depuración
if($result === false){
  $err = mysqli_error($link);
  // Cerrar conexión
  mysqli_close($link);
  // Devolver respuesta vacía con información de error (no mostrar en producción)
  $retorno = array();
  $retorno["resultados"] = array();
  $retorno["mantenedores"] = $mantenedores;
  $retorno["error"] = $err;
  $retorno["sql"] = $sql;
  echo json_encode($retorno);
  exit;
}

// Inicialización de un array para almacenar los datos
$informes = array();

// Bucle a través de cada fila de resultados y almacenamiento de datos en el array
while ($row = mysqli_fetch_assoc($result)) {

  $informe = array();
  foreach (array_keys($row) as $key) {
    if (in_array($key, ["id","id_contratada","destino","num_viviendas","num_paradas","puesta_marcha","insp_anterior","plazo","legislacion"])) {
      $informe[$key] = $row[$key];
    }
  }
  $primera = array();
  foreach (array_keys($row) as $key) {
    if (in_array($key, ["fecha","id_usuarios","hora_ini","hora_fin","industria","observaciones_check","resultado","latitud","longitud","enviada_cliente","esmodificacion","fecha_modificacion","comentarios_mod","id_revision","observaciones","acude","proxima"])) {
      if($key=="fecha" || $key=="industria"){
        if($row[$key]!="0000-00-00" AND $row[$key]!="" AND $row[$key]!=null){
            $row[$key] = $row[$key];
            $primera[$key."_dmy"] = date("d-m-Y", strtotime($row[$key]));
        }else{
            $row[$key] = "-";
            $primera[$key."_dmy"] = "-";
        }
        if($key=="fecha" ){
          $primera["fecha_y"] =  date("Y", strtotime($row[$key]));
        }  
      }
      if($key=="resultado"){
        if($row[$key]==0) $primera["resultado_f"] = "-";
        if($row[$key]==1) $primera["resultado_f"] = "F";
        if($row[$key]==2) $primera["resultado_f"] = "FL";
        if($row[$key]==3) $primera["resultado_f"] = "DG";
        if($row[$key]==4) $primera["resultado_f"] = "DM";
      }
      if($key=="id_usuarios"){
        $user_array = explode("-", $usuarios[$row[$key]]);
        $primera["usuario"] = $user_array[1];
        $primera["usuario_ab"] = $user_array[0];
      }    
      $primera[$key] = $row[$key];
    }
  }

  $cliente = array();
  foreach (array_keys($row) as $key) {
      if (in_array($key, ["cli_id","rae","nombre","direccion","localidad","municipio","cp","provincia","id_campo","id_mantenedor","id_administrador","quien_contrata","telefono","telefono2","email","tiene_datos","vencimiento","cada","contratada","cli_observaciones"])) {
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
      if (in_array($key, ["con_id","id_cliente","fecha","id_usuarios","tipo","estado","num_control","con_observaciones","nocobrar","enviada_cobrar"])) {
          if($key=="id_usuarios"){
              if($usuarios[$row[$key]]!=null){
                  $row[$key] = $usuarios[$row[$key]];
              }else{
                  $row[$key] = "-";
              }
          }
          $contratada[$key] = $row[$key];
      }
  }
  // Construir el objeto de salida con la estructura solicitada
  $item = array();

  // Campos principales del informe (nivel superior)
  $item['id'] = isset($row['id']) ? (string)$row['id'] : null;
  $item['id_contratada'] = isset($row['id_contratada']) ? (string)$row['id_contratada'] : null;
  $item['id_usuarios'] = isset($row['id_usuarios']) ? (int)$row['id_usuarios'] : null;
  $item['fecha'] = isset($row['fecha']) ? $row['fecha'] : null;
  $item['hora_ini'] = isset($row['hora_ini']) ? $row['hora_ini'] : null;
  $item['hora_fin'] = isset($row['hora_fin']) ? $row['hora_fin'] : null;
  $item['estado'] = isset($row['estado']) ? $row['estado'] : null;
  $item['resultado'] = isset($row['resultado']) ? $row['resultado'] : null;
  $item['plazo'] = isset($row['plazo']) ? $row['plazo'] : null;
  $item['legislacion'] = isset($row['legislacion']) ? $row['legislacion'] : null;
  $item['acude'] = isset($row['acude']) ? $row['acude'] : null;
  $item['proxima'] = isset($row['proxima']) ? $row['proxima'] : null;
  $item['industria'] = isset($row['industria']) ? $row['industria'] : null;
  $item['observaciones'] = isset($row['observaciones']) ? $row['observaciones'] : null;
  $item['observaciones_check'] = isset($row['observaciones_check']) ? $row['observaciones_check'] : null;
  $item['gps_latitud'] = isset($row['latitud']) ? $row['latitud'] : (isset($row['gps_latitud']) ? $row['gps_latitud'] : null);
  $item['gps_longitud'] = isset($row['longitud']) ? $row['longitud'] : (isset($row['gps_longitud']) ? $row['gps_longitud'] : null);
  $item['enviada_cliente'] = isset($row['enviada_cliente']) ? $row['enviada_cliente'] : null;
  $item['esmodificacion'] = isset($row['esmodificacion']) ? $row['esmodificacion'] : 0;
  $item['fecha_modificacion'] = isset($row['fecha_modificacion']) ? $row['fecha_modificacion'] : null;
  $item['comentarios_mod'] = isset($row['comentarios_mod']) ? $row['comentarios_mod'] : null;
  $item['id_revision'] = isset($row['id_revision']) ? $row['id_revision'] : null;

  if($item['fecha']!=null) $item['fecha_dmy'] = date("d-m-Y", strtotime($item['fecha']));
  if($item['fecha']!=null) $item['fecha_y'] = date("Y", strtotime($item['fecha']));
  if($item['industria']!=null){
    $item['industria_dmy'] = date("d-m-Y", strtotime($item['industria']));
  }else{
    $item['industria_dmy'] = "-";
  }
  if($item['resultado']==0) $item['resultado_f'] = "-";
  if($item['resultado']==1) $item['resultado_f'] = "F";
  if($item['resultado']==2) $item['resultado_f'] = "FL";
  if($item['resultado']==3) $item['resultado_f'] = "DG";
  if($item['resultado']==4) $item['resultado_f'] = "DM";
  if($item['id_usuarios']!=null && isset($usuarios[$item['id_usuarios']])){
      $user_array = explode("-", $usuarios[$item['id_usuarios']]);
      $item['usuario'] = $user_array[1];
      $item['usuario_ab'] = $user_array[0];
  }else{
      $item['usuario'] = "-";
      $item['usuario_ab'] = "-";
  }

  // Contratada: preferir alias de consulta si existen
  $contratada_obj = array();
  $contratada_obj['id'] = isset($row['con_id']) ? (string)$row['con_id'] : (isset($row['id_contratada']) ? (string)$row['id_contratada'] : null);
  $contratada_obj['id_cliente'] = isset($row['id_cliente']) ? (string)$row['id_cliente'] : null;
  $contratada_obj['fecha'] = isset($row['con_fecha']) ? $row['con_fecha'] : (isset($row['fecha']) ? $row['fecha'] : null);
  $contratada_obj['id_usuarios'] = isset($row['id_usuarios']) ? (int)$row['id_usuarios'] : null;
  $contratada_obj['estado'] = isset($row['con_estado']) ? $row['con_estado'] : (isset($row['con_estado']) ? $row['con_estado'] : null);
  $contratada_obj['num_control'] = isset($row['num_control']) ? $row['num_control'] : null;
  $contratada_obj['observaciones'] = isset($row['con_observaciones']) ? $row['con_observaciones'] : null;
  $contratada_obj['enviada_cobrar'] = isset($row['enviada_cobrar']) ? $row['enviada_cobrar'] : null;
  $contratada_obj['nocobrar'] = isset($row['nocobrar']) ? $row['nocobrar'] : 0;

  // Cliente dentro de contratada: mapear campos quitando prefijo si existe
  $cliente_obj = array();
  $cliente_obj['cp'] = isset($cliente['cp']) ? $cliente['cp'] : (isset($row['cp']) ? $row['cp'] : null);
  $cliente_obj['direccion'] = isset($cliente['direccion']) ? $cliente['direccion'] : (isset($row['direccion']) ? $row['direccion'] : null);
  $cliente_obj['email'] = isset($cliente['email']) ? $cliente['email'] : (isset($row['email']) ? $row['email'] : null);
  $cliente_obj['id'] = isset($cliente['cli_id']) ? (string)$cliente['cli_id'] : (isset($row['cli_id']) ? (string)$row['cli_id'] : null);
  $cliente_obj['id_administrador'] = isset($cliente['id_administrador']) ? $cliente['id_administrador'] : (isset($row['id_administrador']) ? $row['id_administrador'] : null);
  $cliente_obj['id_campo'] = isset($cliente['id_campo']) ? $cliente['id_campo'] : (isset($row['id_campo']) ? $row['id_campo'] : null);
  $cliente_obj['id_mantenedor'] = isset($cliente['id_mantenedor']) ? $cliente['id_mantenedor'] : (isset($row['id_mantenedor']) ? $row['id_mantenedor'] : null);
  $cliente_obj['localidad'] = isset($cliente['localidad']) ? $cliente['localidad'] : (isset($row['localidad']) ? $row['localidad'] : null);
  $cliente_obj['mantenedor'] = isset($cliente['mantenedor']) ? $cliente['mantenedor'] : null;
  $cliente_obj['municipio'] = isset($cliente['municipio']) ? $cliente['municipio'] : (isset($row['municipio']) ? $row['municipio'] : null);
  $cliente_obj['nombre'] = isset($cliente['nombre']) ? $cliente['nombre'] : (isset($row['nombre']) ? $row['nombre'] : null);
  $cliente_obj['observaciones'] = isset($cliente['cli_observaciones']) ? $cliente['cli_observaciones'] : (isset($row['cli_observaciones']) ? $row['cli_observaciones'] : null);
  $cliente_obj['provincia'] = isset($cliente['provincia']) ? $cliente['provincia'] : (isset($row['provincia']) ? $row['provincia'] : null);
  $cliente_obj['quien_contrata'] = isset($cliente['quien_contrata']) ? $cliente['quien_contrata'] : (isset($row['quien_contrata']) ? $row['quien_contrata'] : null);
  $cliente_obj['rae'] = isset($cliente['rae']) ? $cliente['rae'] : (isset($row['rae']) ? $row['rae'] : null);
  $cliente_obj['telefono'] = isset($cliente['telefono']) ? $cliente['telefono'] : (isset($row['telefono']) ? $row['telefono'] : null);
  $cliente_obj['telefono2'] = isset($cliente['telefono2']) ? $cliente['telefono2'] : (isset($row['telefono2']) ? $row['telefono2'] : null);
  $cliente_obj['tiene_datos'] = isset($cliente['tiene_datos']) ? $cliente['tiene_datos'] : (isset($row['tiene_datos']) ? $row['tiene_datos'] : null);
  $cliente_obj['vencimiento'] = isset($cliente['vencimiento']) ? $cliente['vencimiento'] : (isset($row['vencimiento']) ? $row['vencimiento'] : null);

  $contratada_obj['cliente'] = $cliente_obj;

  // Añadir contratada anidada al elemento principal
  $item['contratada'] = $contratada_obj;

  $informes[] = $item;
}

if (mysqli_num_rows($result) > 0) {

  // Cierre de la conexión a la base de datos
  mysqli_close($link);

  $retorno = array();
  // añadimos una línea al final con los mantenedores
  $retorno["resultados"] = $informes;
  $retorno["mantenedores"] = $mantenedores;

  // Codificación del array de datos en formato JSON y envío como respuesta
  echo json_encode($retorno);

}else{
  if (!$informes) {
    $retorno = array();
    $vacio = array();
    $retorno["resultados"] = $vacio;
    $retorno["mantenedores"] = $mantenedores;
    echo json_encode($retorno);
  }
}

?>