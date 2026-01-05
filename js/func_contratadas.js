// Funciones relacionadas con la pestaña de contratadas
var readContratadas = function(id, totalParams){
	// limpiamos la tabla de contratadas
	$("#table_con tbody").empty();
	// Realizar la petición HTTP a la API
	$.ajax({
		url: 'services/contratadas.php',
		type: 'POST',
		data: totalParams,
		success: function(data) {
		    // Recorrer los datos devueltos por la consulta
		    datos = JSON.parse(data)["resultados"];
		    dataLayer.push({
		    	"event" : "service",
		    	"type" : "list_con",
		    	"data" : datos
		    });
		    var totalResultados = 0;
		    $.each(datos, function(index, item) {
		      // Construir la fila de la tabla con los datos
		      var tableRow = "<tr>" +
		        "<td class='ancho50'>";
		        if(item.cliente.contratada.estado==0){
		          tableRow += "<a class='btn-floating btn-small waves-effect waves-light green' title='Enviar a inspección'>" +
		            "<i class='material-icons'>phone_android</i>" +
		          "</a>";
		      	}else{
		          tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light green' title='Enviada a inspección'>" +
		            "<i class='material-icons'>phone_android</i>" +
		          "</a>";
		      	}
		        tableRow += "</td>" +
		        "<td class='ancho50'>" + item.cliente.contratada.num_control + "</td>" +
		        "<td class='ancho50'>-</td>" +
		        "<td class='ancho75'>" + item.cliente.rae + "</td>" +
		        "<td class='ancho50'>" +
		          "<a seccion='con' tipo='frm_editcon' data-id='" + item.cliente.contratada.con_id + "' class='editar_con btn-floating btn-small waves-effect waves-light green' title='Editar contratada'>" +
		            "<i class='material-icons'>edit</i>" +
		          "</a>" +
		        "</td>" +
		        "<td><span class='main-text'>" + item.cliente.nombre + "</span><br><span class='secondary-text'>" + item.cliente.direccion + "</span></td>" +
		        "<td class='ancho75'>" + item.cliente.cp + "</td>" +
		        "<td>" + item.cliente.localidad + "</td>" +
		        "<td class='ancho200'>" + item.cliente.mantenedor + "</td>" +
		        "<td class='ancho150'>" + item.cliente.vencimiento + "</td>" +
		        "<td class='ancho100'>";
		        if(item.cliente.contratada.comunicada_dmy != "-"){
							tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Comunicada el día " + item.cliente.contratada.comunicada_dmy + "'><i class='material-icons'>comment</i></a>";
		        }else{
		        	tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light orange' title='Comunicada el día " + item.cliente.contratada.comunicada_dmy + "'><i class='material-icons'>comment</i></a>";
		        }
		        tableRow += "</td>" + 
		        "<td class='ancho50'>" +
		          "<a class='btn-floating btn-small waves-effect waves-light red' title='Más'>" +
		            "<i class='material-icons'>more_vert</i>" +
		          "</a>" +
		        "</td>" +
		      "</tr>";

		      // Agregar la fila a la tabla
		      $("#table_con").append(tableRow);
		      totalResultados++;
		    });

		    // Crear la fila que muestra el total de resultados
			var totalRow = "<span class='main-text'>Total de resultados:</span> <span class='secondary-text'>" + totalResultados + "</span>";
			// Agregar la fila a la tabla
			$("#resultados_con").html(totalRow);


		    $('#app-content > div#loading').hide();
			$('#app-content div#tab_'+id).show();
		},
		error: function(xhr, status, error) {
			// Mostrar un mensaje de error en el centro de la pantalla
			$('#app-content div#error').html(error);
			$('#app-content div#error').show();
		}
	});
}


// Filtros de contratada
jQuery(document).on("keydown", "#tab_con [id*=filtro_con]", function(e){
	// Mostrar botón limpiar cuando se escribe
	jQuery("#filtrar_con_clear").removeClass("hide");
	// Si se pulsa Enter, ejecutar búsqueda
	if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
		e.preventDefault();
		jQuery(this).parents("#tab_con").find("#filtrar_con").click();
	}
});

jQuery(document).on("click", "#filtrar_con", function() {
  var total = jQuery(this).parents("#tab_con").find("#filtro_con_total").val();
  if((parseInt(total)>=1)){
	  var nombre = jQuery(this).parents("#tab_con").find("#filtro_con_nombre").val();
	  var direccion = jQuery(this).parents("#tab_con").find("#filtro_con_direccion").val();
	  var localidad = jQuery(this).parents("#tab_con").find("#filtro_con_localidad").val();
	  var rae = jQuery(this).parents("#tab_con").find("#filtro_con_rae").val();
	  var fechaini = jQuery(this).parents("#tab_con").find("#filtro_con_fechainicio").val();
	  var fechafin = jQuery(this).parents("#tab_con").find("#filtro_con_fechafin").val();
	  var filtros = {
	  	filtro_total : total,
	  	filtro_nombre : nombre,
	  	filtro_direccion : direccion,
	  	filtro_localidad : localidad,
			filtro_rae : rae,
			filtro_fecha_inicio : fechaini,
			filtro_fecha_fin : fechafin
	  };
	  var tipo = "con";
		readContratadas(tipo, filtros);
  }else{
    modalError("ERROR","Hay que introducir un número mínimo de resultados esperados! Para ello introduce un valor en el campo registros, dentro del módulo de filtros.", false);
  }
});

// Limpiar filtros de contratadas
jQuery(document).on("click", "#filtrar_con_clear", function() {
	jQuery(this).addClass("hide");
	jQuery(this).parents("#tab_con").find("#filtro_con_nombre").val('');
	jQuery(this).parents("#tab_con").find("#filtro_con_direccion").val('');
	jQuery(this).parents("#tab_con").find("#filtro_con_localidad").val('');
	jQuery(this).parents("#tab_con").find("#filtro_con_rae").val('');	
	jQuery(this).parents("#tab_con").find("#filtro_con_fechainicio").val('');	
	jQuery(this).parents("#tab_con").find("#filtro_con_fechafin").val('');	
	jQuery(this).parents("#tab_con").find("label").not(":eq(0)").removeClass("active");
	jQuery(this).parents("#tab_con").find("#filtro_con_total").val('15');	
	jQuery(this).parents("#tab_con").find("#filtrar_con").click();
});


var openContratada = function(seccion, cual, id){
	// formulario edicion cliente
	if(cual=="frm_editcon"){
		// Realizar la petición HTTP a la API
		var totalParams = {
			filtro_id : id
		}
		$.ajax({
			url: 'services/contratadas.php',
			type: 'POST',
			data: totalParams,
			success: function(data) {
			    // Recorrer los datos devueltos por la consulta
			    item = JSON.parse(data)["resultados"][0];
			    dataLayer.push({
		    		"event" : "service",
		    		"type" : "list_con",
		    		"data" : item
		    	});
			    formas_pago = JSON.parse(data)["formas_pago"];
			    var title = "Editar contratada";
			    title+= " - RAE: "+item.cliente.rae;
					$("#modal_"+seccion).find(".modal_txt_title").text(title);
					$("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
					$("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");
					var frm_tabs = '<ul class="tabs">' + 
		        '<li class="tab col s3"><a class="tablink1" href="#tab1_con">Cliente</a></li>' + 
		        '<li class="tab col s3"><a class="active tablink2" href="#tab2_con">Contratación</a></li>' + 
		        '<li class="tab col s3"><a class="tablink3" href="#tab3_con">Inspección</a></li>' + 
		        '<li class="tab col s3"><a class="tablink4" href="#tab4_con">Facturación</a></li>' + 
		        '<li class="tab col s3"><a class="tablink5" href="#tab5_con">Otros</a></li>' + 
		      '</ul>';
					var frm_render = '<form id="contratada_frm_editar">' + 

					'<div id="tab1_con" class="col s12">' + 
				    '<div class="input-field anchoFrm4">' +
				      '<input type="text" id="rae" name="rae" value="' + item.cliente.rae + '" disabled>' +
				      '<label for="rae" class="active">RAE</label>' +
				    '</div>' +
				    '<div class="input-field anchoFrm4">' +
				      '<select id="mantenedor_con" name="mantenedor_con" disabled>';
				      	for (let clave in mantenedores){
					      	if(item.cliente.id_mantenedor==clave){
					      		frm_render += '<option value="'+ clave +'" selected>'+ mantenedores[clave] +'</option>';
					      	}else{
					      		frm_render += '<option value="'+ clave +'">'+ mantenedores[clave] +'</option>';				      	
					      	}
				      	};
				      frm_render+='</select>' + 
				      '<label for="mantenedor_con">Mantenedor</label>' +
				    '</div>' +	
						'<div class="input-field">' +
				      '<input type="text" id="nombre" name="nombre" value="' + item.cliente.nombre + '" disabled>' +
				      '<label for="nombre" class="active">Titular</label>' +
				    '</div>' +
				    '<div class="input-field">' +
				      '<input type="text" id="direccion" name="direccion" value="' + item.cliente.direccion + '" disabled>' +
				      '<label for="direccion" class="active">Dirección</label>' +
				    '</div>' +
				    '<div class="input-field anchoFrm4">' +
				      '<input type="text" id="cp" name="cp" value="' + item.cliente.cp + '" disabled>' +
				      '<label for="cp" class="active">Código Postal</label>' +
				    '</div>' +
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="localidad" name="localidad" value="' + item.cliente.localidad + '" disabled>' +
				      '<label for="localidad" class="active">Localidad</label>' +
				    '</div>' +   
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="municipio" name="municipio" value="' + item.cliente.municipio + '" disabled>' +
				      '<label for="municipio" class="active">Municipio</label>' +
				    '</div>' +      	
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="provincia" name="provincia" value="' + item.cliente.provincia + '" disabled>' +
				      '<label for="provincia" class="active">Provincia</label>' +
				    '</div>' +    
				    '<div class="input-field">' +
				      '<input type="text" id="observaciones" name="observaciones" value="' + item.cliente.observaciones + '" disabled>' +
				      '<label for="observaciones" class="active">Observaciones</label>' +
				    '</div>' +    
			    '</div>' +	

					'<div id="tab2_con" class="active col s12">' + 
				    '<div class="input-field anchoFrm4">' +
				      '<input type="date" id="fecha" name="fecha" value="' + item.cliente.contratada.fecha + '">' +
				      '<label for="fecha" class="active">Fecha contratada</label>' +
				    '</div>' +		
				    '<div class="input-field anchoFrm4">' +
				      '<input type="text" id="num_control" name="num_control" value="' + item.cliente.contratada.num_control + '">' +
				      '<label for="num_control" class="active">Número de Solicitud</label>' +
				    '</div>' +	
					'<div class="input-field anchoFrm2">' +
				      '<input type="text" id="id_usuarios" name="id_usuarios" value="' + item.cliente.contratada.usuario + '" disabled>' +
				      '<label for="id_usuarios" class="active">Contratada por</label>' +
				    '</div>' +			
						'<div class="input-field anchoFrm2">' +
				      '<input type="text" id="estado_actual" name="estado_actual" value="';

							if(item.cliente.contratada.estado==0) frm_render  += 'Inicial';
							if(item.cliente.contratada.estado==1) frm_render  += 'Abierta';
							if(item.cliente.contratada.estado==2) frm_render  += 'Finalizada';
				      frm_render  += '" disabled>' +
				      '<label for="estado_actual" class="active">Estado</label>' +
				    '</div>' +		
				    '<div class="input-field">' +
				      '<input type="text" id="con_observaciones" name="con_observaciones" value="' + item.cliente.contratada.con_observaciones + '">' +
				      '<label for="con_observaciones" class="active">Observaciones</label>' +
				    '</div>' +    
			    '</div>' +	

			    '<div id="tab3_con" class="col s12">' + 	    
				    '<div class="input-field anchoFrm4">' +
				      '<select id="tipo" name="tipo">';
				      	if(item.cliente.contratada.tipo==1){
				      		frm_render += '<option value="1" selected>Primera inspección</option>';
				      		frm_render += '<option value="2">Segunda inspección</option>';
				      		frm_render += '<option value="3">Tercera inspección</option>';
				      	}else if(item.cliente.contratada.tipo==2){
									frm_render += '<option value="1">Primera inspección</option>';
									frm_render += '<option value="2" selected>Segunda inspección</option>';
									frm_render += '<option value="3">Tercera inspección</option>';
				      	}else if(item.cliente.contratada.tipo==3){
									frm_render += '<option value="1">Primera inspección</option>';
									frm_render += '<option value="2">Segunda inspección</option>';
									frm_render += '<option value="3" selected>Tercera inspección</option>';
				      	}
				      frm_render+='</select>' + 
				      '<label for="tipo">¿Tipo de inspección?</label>' +
				    '</div><br>' +				
				    '<div class="input-field anchoFrm4">';
				    if(item.vencimiento!="0000-00-00"){
				    	frm_render+='<input type="date" id="comunicada" name="comunicada" value="' + item.cliente.contratada.comunicada + '">';
						}else{
							frm_render+='<input type="date" id="comunicada" name="comunicada">';
						}
					      frm_render+='<label for="comunicada" class="active">Fecha comunicación</label>' +
					  '</div>' +
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="comunicada_aquien" name="comunicada_aquien" value="' + item.cliente.contratada.comunicada_aquien + '">' +
				      '<label for="comunicada_aquien" class="active">¿A quién?</label>' +
				    '</div>' +
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="comunicada_como" name="comunicada_como" value="' + item.cliente.contratada.comunicada_como + '">' +
				      '<label for="comunicada_como" class="active">¿Cómo se comunicó?</label>' +
				    '</div>' +      
			    '</div>' +	

			    '<div id="tab4_con" class="col s12">' + 
				    '<div class="input-field anchoFrm4">' +
				      '<select id="nocobrar" name="nocobrar">';
				      	if(item.cliente.contratada.nocobrar==0){
				      		frm_render += '<option value="0" selected>Facturar</option>';
				      		frm_render += '<option value="1">No cobrar</option>';
				      	}else if(item.cliente.contratada.nocobrar==1){
									frm_render += '<option value="0">Facturar</option>';
									frm_render += '<option value="1" selected>No cobrar</option>';
				      	}
				      frm_render+='</select>' + 
				      '<label for="nocobrar">¿Facturar?</label>' +
				    '</div><br>' +		
				    '<div class="input-field anchoFrm4">' +
				      '<input type="text" id="precio" name="precio" value="' + item.cliente.contratada.precio + '">' +
				      '<label for="precio" class="active">Precio de la inspección</label>' +
				    '</div>' +
				    '<div class="input-field anchoFrm2">' +
							'<select id="con_id_formapago" name="con_id_formapago">';
				      	for (let clave in formas_pago){
					      	if(item.cliente.contratada.con_id_formapago==clave){
					      		frm_render += '<option value="'+ clave +'" selected>'+ formas_pago[clave] +'</option>';
					      	}else{
					      		frm_render += '<option value="'+ clave +'">'+ formas_pago[clave] +'</option>';
					      	}
				      	};
				      frm_render+='</select>' + 
				      '<label for="con_id_formapago">Forma de pago</label>' +
				    '</div><br>' +  
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="con_id_tarifa" name="con_id_tarifa" value="' + item.cliente.contratada.con_id_tarifa + '">' +
				      '<label for="con_id_tarifa" class="active">Tarifa</label>' +
				    '</div>' +			
			    '</div>' +	
			    '<div id="tab5_con" class="col s12">' + 
				    '<div class="input-field">' +
				      '<input type="text" id="id" name="id" value="' + item.cliente.contratada.con_id + '" disabled>' +
				      '<label for="id" class="active">ID Contratada BBDD</label>' +
				    '</div>' +     
				    '<div class="input-field">' +
				      '<input type="text" id="con_id_formas_pago" name="con_id_formas_pago" value="' + item.cliente.contratada.con_id_formas_pago + '" disabled>' +
				      '<label for="con_id_formas_pago" class="active">ID Forma pago BBDD</label>' +
				    '</div>' +   
				    '<div class="input-field">' +
				      '<input type="text" id="id_tipo" name="id_tipo" value="' + item.cliente.contratada.tipo + '" disabled>' +
				      '<label for="id_tipo" class="active">ID Tipo inspección BBDD</label>' +
				    '</div>' +   
			    '</div>' +	

 					'</form>';
				  $("#modal_"+seccion).find(".contentTabs").html(frm_tabs);
				  $("#modal_"+seccion).find(".contentForm").html(frm_render);
				  $('select#mantenedor_con').formSelect();
				  $('select#tipo').formSelect();
				  $('select#nocobrar').formSelect();
				  $('select#con_id_formapago').formSelect();
				  $("#modal_"+seccion).find('.tabs').tabs();
				  $("#modal_"+seccion).modal({
						dismissible: false
					});
					$("#modal_"+seccion).modal("open");		
			},
			error: function(xhr, status, error) {
				// Mostrar un mensaje de error en el centro de la pantalla
				$('#app-content div#error').html(error);
				$('#app-content div#error').show();
			}
		});				
	}
}