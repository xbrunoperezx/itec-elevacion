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
		        "<td class='ancho50'>&nbsp;</td>" +
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
		        "<td class='ancho100'>"+
					"<a class='btn-floating btn-small waves-effect waves-light ";
					if(item.cliente.contratada.estado=="0") tableRow += "grey disabled' title='Inicial'>";
					if(item.cliente.contratada.estado=="1") tableRow += "orange' title='Abierta'>";
					if(item.cliente.contratada.estado=="2") tableRow += "green' title='Finalizada'>";
					tableRow += item.cliente.contratada.estado_f +"</a>" +
				"</td>" + 
				"<td class='ancho50'>" +
					"<a class='more_con btn-floating btn-small waves-effect waves-light red' title='Más' data-id='" + item.cliente.contratada.con_id + "'>" +
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

// Cargar listado de informes para una contratada en la pestaña Inspección
var readInformesContratada = function(id){
	var container = jQuery('#tab3_con');
	container.html('Cargando...');
	$.ajax({
		url: 'services/primeras.php',
		type: 'POST',
		data: { filtro_id_contratada: id },
		success: function(data){
			try{ var parsed = JSON.parse(data); }catch(e){ container.html('Error parseando respuesta'); return; }
			var datos = parsed['resultados'] || [];
			if(!datos || datos.length===0){
				container.html('No hay informes');
				return;
			}
			var html = '<div class="right input-field botonesFormEdit"><button type="button" id="btn_refresh_informes" data-id="'+id+'" class="btn-floating waves-effect waves-light blue" title="Actualizar"><i class="material-icons">refresh</i></button></div>';
			html += '<table class="highlight" id="table_informes_con"><thead><tr><th>Informe</th><th>Fecha</th><th>Hora</th><th>Resultado</th><th>Próxima</th><th>Industria</th><th>Acude</th><th>Observaciones</th></tr></thead><tbody>';
			datos.forEach(function(row){
				var hora = (row.hora_ini||'') + (row.hora_fin ? (' - '+row.hora_fin) : '');
				html += '<tr>'+
					'<td>'+row.informe+'</td>'+
					'<td>'+row.fecha+'</td>'+
					'<td>';
					// Icono comunicada
					if(row.comunicada != "-"){
						html += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Comunicada el día " + 
						row.comunicada + " a " + row.comunicada_aquien + ", " + row.comunicada_como + 
						"'><i class='material-icons'>comment</i></a>";
					}else{
						html += "<a class='disabled btn-floating btn-small waves-effect waves-light orange disabled' title=''><i class='material-icons'>comment</i></a>";
					}

					html += "&nbsp;";
					// Icono localización Google Maps
					if(row.gps_latitud != "" && row.gps_longitud != ""){
						html += "<a class='btn-floating btn-small waves-effect waves-light blue' title='Ver en Google Maps\nLat: " + row.gps_latitud + "\nLon: "+row.gps_longitud + "' href='http://maps.google.com/?q=" + row.gps_latitud + ","+row.gps_longitud + "' target='_blank'><i class='material-icons'>gps_fixed</i></a>";
					}else{
						html += "<a class='disabled btn-floating btn-small waves-effect waves-light blue disabled' title='Ver en Google Maps'><i class='material-icons'>gps_fixed</i></a>";
					}	

					html += "&nbsp;";
					// Icono hora
					if(row.hora_ini != "" && row.hora_fin != ""){
						html += "<a class='btn-floating btn-small waves-effect waves-light green' title='Hora inicio: "+row.hora_ini+"h\nHora fin: "+row.hora_fin+"h'><i class='material-icons'>access_time</i></a>";
					}
					if(row.hora_ini != "" && row.hora_fin == ""){
						html += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Hora inicio: "+row.hora_ini+"h\n¡Inspección en curso!'><i class='material-icons'>access_time</i></a>";
					}	
					if(row.hora_ini == "" && row.hora_fin == ""){
						html += "<a class='disabled btn-floating btn-small waves-effect waves-light red' title='Sin comenzar...'><i class='material-icons'>access_time</i></a>";
					}	        
					html += '</td>'+
					'<td>' +
					"<a class='btn-floating btn-small waves-effect waves-light grey' title='Inspector: " + row.usuario + "'>" +
					row.usuario_ab +
					"</a>&nbsp;" +
					"<a class='btn-floating btn-small waves-effect waves-light ";
					if(row.resultado_f=="-") html += "grey disabled' title='Sin hacer'>";
					if(row.resultado_f=="F") html += "green' title='Favorable'>";
					if(row.resultado_f=="FL") html += "green' title='Favorable (defectos leves)'>";
					if(row.resultado_f=="DG") html += "red' title='Desfavorable (defectos graves)'>";
					if(row.resultado_f=="DM") html += "red' title='Desfavorable (defectos muy graves)'>";
					html += row.resultado_f +"</a>" +
					'</td>'+
					'<td>'+row.proxima_dmy+'</td>'+
					'<td>'+row.industria_dmy+'</td>'+
					'<td>'+row.acude+'</td>'+
					'<td>'+row.observaciones+'</td>'+
					'</tr>';
			});
			html += '</tbody></table>';
			container.html(html);
		},
		error: function(xhr,status,error){ container.html('Error: '+error); }
	});
};

// Handler para botón actualizar informes
jQuery(document).on('click', '#btn_refresh_informes', function(e){
	e.preventDefault();
	var id = jQuery(this).data('id');
	if(id) readInformesContratada(id);
});


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
				      '<input type="text" id="estado_actual" name="estado_actual" value="' + item.cliente.contratada.estado_fc + '" disabled>' +
				      '<label for="estado_actual" class="active">Estado</label>' +
				    '</div>' +		
				    '<div class="input-field">' +
				      '<input type="text" id="con_observaciones" name="con_observaciones" value="' + item.cliente.contratada.con_observaciones + '">' +
				      '<label for="con_observaciones" class="active">Observaciones</label>' +
				    '</div>' +    
			    '</div>' +	

			    '<div id="tab3_con" class="col s12">' + 	    
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
					// Cargar lista de informes (pestaña Inspección)
					if(item && item.cliente && item.cliente.contratada && item.cliente.contratada.con_id){
						readInformesContratada(item.cliente.contratada.con_id);
					}
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

// Menú contextual para cada fila de contratadas (ocultar fila / cancelar)
jQuery(document).on("click", ".more_con", function(e){
		e.preventDefault();
		// cerrar cualquier menú abierto
		jQuery('.row-menu').remove();

		var $btn = jQuery(this);
		var itemId = $btn.data('id');
		var offset = $btn.offset();

		var menu = jQuery("<div class='row-menu'><ul><li class='row-menu-hide'>Ocultar fila</li><li class='row-menu-cancel'>Cancelar</li></ul></div>");

		// añadirlo oculto para medir y posicionar correctamente (alineado a la derecha del icono)
		menu.css({ visibility: 'hidden', top: 0, left: 0 });
		jQuery('body').append(menu);

		// medir dimensiones y ventana
		var menuW = menu.outerWidth();
		var menuH = menu.outerHeight();
		var winW = jQuery(window).width();
		var winTop = jQuery(window).scrollTop();

		// calcular izquierda para alinear a la derecha del botón
		var desiredLeft = offset.left + $btn.outerWidth() - menuW;
		if (desiredLeft + menuW > winW - 6) {
				desiredLeft = winW - menuW - 6;
		}
		if (desiredLeft < 6) {
				desiredLeft = 6;
		}

		// calcular top (por defecto debajo del botón)
		var desiredTop = offset.top + $btn.outerHeight() + 6;
		if (desiredTop + menuH > winTop + jQuery(window).height()) {
				desiredTop = offset.top - menuH - 6;
				if (desiredTop < winTop + 6) desiredTop = winTop + 6;
		}

		menu.css({ top: desiredTop + 'px', left: desiredLeft + 'px', visibility: 'visible' });

		// acción ocultar
		menu.on('click', '.row-menu-hide', function(ev){
				ev.stopPropagation();
				var $tr = $btn.closest('tr');
				$tr.addClass('hidden-row');
				menu.remove();
		});

		// cancelar
		menu.on('click', '.row-menu-cancel', function(ev){
				ev.stopPropagation();
				menu.remove();
		});

		// cerrar si se hace click fuera
		setTimeout(function(){
			jQuery(document).on('click.rowMenuClose', function(ev){
				if(jQuery(ev.target).closest('.row-menu').length===0 && jQuery(ev.target).closest('.more_con').length===0){
					jQuery('.row-menu').remove();
					jQuery(document).off('click.rowMenuClose');
				}
			});
		}, 10);
});