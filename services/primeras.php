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
$id = $_POST["filtro_id"];

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

if($id==""){
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
    $where_clause .= ' AND resultado=0';
  }
  $columnas = array('inf.*','cli.id AS cli_id','cli.rae','cli.nombre','cli.direccion','cli.localidad','cli.municipio','cli.cp','cli.provincia','cli.id_campo','cli.id_mantenedor','cli.id_administrador','cli.quien_contrata','cli.telefono','cli.telefono2','cli.email','cli.tiene_datos','cli.vencimiento','cli.cada','cli.contratada','cli.observaciones AS cli_observaciones','con.id AS con_id','con.id_cliente','con.fecha AS con_fecha','con.id_usuarios','con.informe','con.tipo','con.id_informe','con.estado AS con_estado','con.num_control','con.observaciones AS con_observaciones','con.id_factura','con.nocobrar','con.precio','con.id_formapago AS con_id_formapago','con.enviada_cobrar');

  $columnas = implode(',', $columnas);
  $sql = "SELECT {$columnas} FROM informes inf";
  $sql.= " JOIN contratadas con ON inf.id_contratada = con.id";
  $sql.= " JOIN clientes cli ON con.id_cliente = cli.id".$where_clause;
  $sql.= " ORDER BY fecha DESC LIMIT 0,{$lim}";
}else{
  $sql = "SELECT {$columnas} FROM informes WHERE id=$id";
}

// Ejecuta la consulta
$result = mysqli_query($link, $sql);

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
    if (in_array($key, ["fecha","id_user","hora_ini","hora_fin","velocidad","tipo_aparato","cuarto_maquinas","tipo_puertas","guia","guia2","marca","carga_maxima","num_personas","grupo_tractor","potencia","num_cables","diametro_cables","limitador","cab_nom","cab_dis","contra_nom","contra_dis","lux_sala","lux_hueco","lux_cabina","vel_lim_cab","vel_lim_cab2","vel_lim_media","vel_lim_contra","vel_lim_contra2","vel_lim_media2","dif_fuerza","dif_alumbrado","dina","estado","dina2","continuidad","equipo_1","equipo_2","equipo_3","equipo_4","equipo_5","equipo_6","equipo_7","equipo_8","equipo_9","equipo_10","recorrido","segunda","destinadoa","grupo","industria","observaciones_check","resultado","id_mantenedor","latitud","longitud","enviada_cliente","caducidad1","caducidad2","caducidad3","caducidad4","caducidad5","caducidad6","caducidad7","caducidad8","caducidad9","caducidad10","lista_defectos","holgura_cab_piso","holgura_cab_recinto","holgura_cab_contra","profundidad_foso","desnivel_sala","longitud_faldon","otras_medidas","esmodificacion","fecha_modificacion","comentarios_mod","id_revision","temp_sala","dist_desenclav","prec_parada","observaciones","acude","proxima"])) {
      if($key=="fecha" || $key=="industria"){
        if($row[$key]!="0000-00-00"){
            $row[$key] = $row[$key];
            $primera[$key."_dmy"] = date("d-m-Y", strtotime($row[$key]));
        }else{
            $row[$key] = "-";
            $primera[$key."_dmy"] = "-";
        }
        if($key=="fecha"){
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
      if($key=="id_user"){
        $user_array = explode("-", $usuarios[$row[$key]]);
        $primera["usuario"] = $user_array[1];
        $primera["usuario_ab"] = $user_array[0];
      }    
      $primera[$key] = $row[$key];
    }
  }
  $segunda = array();
  foreach (array_keys($row) as $key) {
    if (in_array($key, ["2fecha","latitud2","longitud2","2id_mantenedor","2hora_ini","2hora_fin","2estado","2resultado","2acude","2observaciones","2proxima","2velocidad","2grupo_tractor","2potencia","2num_cables","2diametro_cables","2limitador","2cab_nom","2cab_dis","2contra_nom","2contra_dis","2lux_sala","2lux_hueco","2lux_cabina","2vel_lim_cab","2vel_lim_cab2","2vel_lim_media","2vel_lim_contra","2vel_lim_contra2","2vel_lim_media2","2dif_fuerza","2dif_alumbrado","2dina","2dina2","2continuidad","2equipo_1","2equipo_2","2equipo_3","2equipo_4","2equipo_5","2equipo_6","2equipo_7","2equipo_8","2equipo_9","2equipo_10","2industria","2observaciones_check","enviada_cliente2","2id_user","2temp_sala","2dist_desenclav","2prec_parada","2holgura_cab_piso","2holgura_cab_recinto","2holgura_cab_contra","2profundidad_foso","2desnivel_sala","2longitud_faldon","2otras_medidas","2caducidad1","2caducidad2","2caducidad3","2caducidad4","2caducidad5","2caducidad6","2caducidad7","2caducidad8","2caducidad9","2caducidad10"])) {
      if($key=="2fecha" || $key=="2industria"){
        if($row[$key]!="0000-00-00"){
            $row[$key] = $row[$key];
            $segunda[$key."_dmy"] = date("d-m-Y", strtotime($row[$key]));
        }else{
            $row[$key] = "-";
            $segunda[$key."_dmy"] = "-";
        }
      }
      if($key=="id_user"){
        $user_array = explode("-", $usuarios[$row[$key]]);
        $segunda["usuario"] = $user_array[1];
        $segunda["usuario_ab"] = $user_array[0];
      }    
      $segunda[$key] = $row[$key];
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
              if($row[$key]!="0000-00-00"){
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
      if (in_array($key, ["con_id","id_cliente","fecha","id_usuarios","informe","tipo","id_informe","estado","num_control","con_observaciones","id_factura","nocobrar","precio","con_id_formapago","enviada_cobrar"])) {
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
  $resultado = array();
  $resultado["informe"] = $informe;
  $resultado["informe"]["primera"] = $primera;
  $resultado["informe"]["segunda"] = $segunda;
  $resultado['contratada'] = $contratada;
  $resultado["cliente"] = $cliente;

  $informes[] = $resultado;  
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