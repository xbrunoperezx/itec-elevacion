// Funciones relacionadas con la pestaña de informes
var readInformes = function(id, totalParams){
	// limpiamos la tabla de contratadas
	$("#table_pri tbody").empty();
	// Realizar la petición HTTP a la API
	$.ajax({
		url: 'services/primeras.php',
		type: 'POST',
		data: totalParams,
		success: function(data) {
		    // Recorrer los datos devueltos por la consulta
		    datos = JSON.parse(data)["resultados"];
		    dataLayer.push({
		    	"event" : "service",
		    	"type" : "list_pri",
		    	"data" : datos
		    });
			var totalResultados = 0;
			$.each(datos, function(index, item) {
				// Construir la fila de la tabla con los datos
				var tableRow = "<tr>" +
				"<td class='ancho50'>&nbsp;</td>" + 
				"<td class='ancho50'>" + item.fecha_y + "</td>" + 
				"<td class='ancho100'>" + item.informe + "</td>" +
				"<td class='ancho75'>" + item.contratada.cliente.rae + "</td>" + 
				"<td class='ancho50'>" +
					"<a seccion='pri' tipo='frm_editpri' data-id='" + item.id + "' class='editar_pri btn-floating btn-small waves-effect waves-light green' title='Editar informe'>" +
					"<i class='material-icons'>edit</i>" +
					"</a>" +
				"</td>" +
				"<td><span class='main-text'>" + item.contratada.cliente.nombre + "</span><br><span class='secondary-text'>" + item.contratada.cliente.direccion + " ( " + item.contratada.cliente.cp + " - " + item.contratada.cliente.localidad + " )</span></td>" +
				"<td class='ancho200'>" + item.contratada.cliente.mantenedor + "</td>" +
				"<td class='ancho150'>";

				// Icono comunicada
				if(item.comunicada != "-"){
					tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Comunicada el día " + 
					item.comunicada + " a " + item.comunicada_aquien + ", " + item.comunicada_como + 
					"'><i class='material-icons'>comment</i></a>";
				}else{
					tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light orange disabled' title=''><i class='material-icons'>comment</i></a>";
				}

				tableRow += "&nbsp;";

				// Icono localización Google Maps
				if(item.gps_latitud != "" && item.gps_longitud != ""){
					tableRow += "<a class='btn-floating btn-small waves-effect waves-light blue' title='Ver en Google Maps\nLat: " + item.gps_latitud + "\nLon: "+item.gps_longitud + "' href='http://maps.google.com/?q=" + item.gps_latitud + ","+item.gps_longitud + "' target='_blank'><i class='material-icons'>gps_fixed</i></a>";
				}else{
					tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light blue disabled' title='Ver en Google Maps'><i class='material-icons'>gps_fixed</i></a>";
				}	

				tableRow += "&nbsp;";

				// Icono hora
				if(item.hora_ini != "" && item.hora_fin != ""){
					tableRow += "<a class='btn-floating btn-small waves-effect waves-light green' title='Hora inicio: "+item.hora_ini+"h\nHora fin: "+item.hora_fin+"h'><i class='material-icons'>access_time</i></a>";
				}
				if(item.hora_ini != "" && item.hora_fin == ""){
					tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Hora inicio: "+item.hora_ini+"h\n¡Inspección en curso!'><i class='material-icons'>access_time</i></a>";
				}	
				if(item.hora_ini == "" && item.hora_fin == ""){
					tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light red' title='Sin comenzar...'><i class='material-icons'>access_time</i></a>";
				}	        
				tableRow += "</td>" + 
				"<td class='ancho150'>" + item.fecha_dmy + "</td>" +
				"<td class='ancho100'>" +
					"<a class='btn-floating btn-small waves-effect waves-light grey' title='Inspector: " + item.usuario + "'>" + item.usuario_ab + "</a>&nbsp;" +
					"<a class='btn-floating btn-small waves-effect waves-light ";
					if(item.resultado_f=="-") tableRow += "grey disabled' title='Sin hacer'>";
					if(item.resultado_f=="F") tableRow += "green' title='Favorable'>";
					if(item.resultado_f=="FL") tableRow += "green' title='Favorable (defectos leves)'>";
					if(item.resultado_f=="DG") tableRow += "red' title='Desfavorable (defectos graves)'>";
					if(item.resultado_f=="DM") tableRow += "red' title='Desfavorable (defectos muy graves)'>";
					tableRow += item.resultado_f +"</a>" +
				"</td>" +
				"<td class='ancho150'>" + item.industria_dmy + "</td>" +
				"<td class='ancho150'>";
				if(item.resultado>0){	
					if(item.enviada_cliente!=null && item.enviada_cliente!=""){
						tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Enviada al cliente el día " + item.enviada_cliente_dmy + "'><i class='material-icons'>send</i></a>&nbsp;";
					}else{
						tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange disabled' title='Pendiente de envío al cliente'><i class='material-icons'>send</i></a>&nbsp;";
					}
					tableRow += "<a seccion='pri' tipo='sheet_pri' data-id='" + item.id + "' class='sheet_pri btn-floating btn-small waves-effect waves-light grey darken-1' title='Hoja de campo'>" +
						"<i class='material-icons'>assignment</i>" +
					"</a>&nbsp;" +
					"<a seccion='pri' tipo='print_pri' data-id='" + item.id + "' class='print_pri btn-floating btn-small waves-effect waves-light light-blue darken-2' title='Generar informe'>" +
						"<i class='material-icons'>picture_as_pdf</i>" +
					"</a>";
				}else{
					tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange disabled' title='Pendiente de envío al cliente'>" +
						"<i class='material-icons'>send</i>" +
					"</a>&nbsp;";
					tableRow += "<a seccion='pri' tipo='sheet_pri' data-id='" + item.id + "' class='disabled sheet_pri btn-floating btn-small waves-effect waves-light grey darken-1' title='Hoja de campo'>" +
						"<i class='material-icons'>assignment</i>" +
					"</a>&nbsp;" +
					"<a seccion='pri' tipo='print_pri' data-id='" + item.id + "' class='disabled print_pri btn-floating btn-small waves-effect waves-light light-blue darken-2' title='Generar informe'>" +
						"<i class='material-icons'>picture_as_pdf</i>" +
					"</a>";		        	
				}
				
				tableRow += "</td>" +
				"<td class='ancho50'>" +
					"<a class='btn-floating btn-small waves-effect waves-light red' title='Más'>" +
						"<i class='material-icons'>more_vert</i>" +
					"</a>" +
				"</td>" +
				"</tr>";

				// Agregar la fila a la tabla
				$("#table_pri").append(tableRow);
				totalResultados++;
			});

			// Crear la fila que muestra el total de resultados
			var totalRow = "<span class='main-text'>Total de resultados:</span> <span class='secondary-text'>" + totalResultados + "</span>";
			
			// Agregar la fila a la tabla
			$("#resultados_pri").html(totalRow);
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

function buildGrupoOptions(legislaciones, selectedNombre){
	var html = '<option value="" disabled' + (!selectedNombre ? ' selected' : '') + '>Selecciona grupo</option>';
	$.each(legislaciones || [], function(index, item){
		var nombre = item.nombre || '';
		var legislacion = item.legislacion || '';
		html += '<option value="' + nombre + '" data-legislacion="' + legislacion + '"' + (nombre === selectedNombre ? ' selected' : '') + '>' + nombre + '</option>';
	});
	return html;
}

function syncGrupoLegislacion(){
	var $grupo = $('#grupo_pri');
	if(!$grupo.length) return;
	var legislacion = $grupo.find('option:selected').data('legislacion') || '';
	$('#legislacion_pri').val(legislacion);
	var $label = $('label[for="legislacion_pri"]');
	if(legislacion){
		$label.addClass('active');
	}else{
		$label.removeClass('active');
	}
}

function syncGoogleMapsButton(){
	var lat = ($('#gps_latitud').val() || '').trim();
	var lon = ($('#gps_longitud').val() || '').trim();
	var $btn = $('#open_google_maps_pri');
	if(!$btn.length) return;
	if(lat !== '' && lon !== ''){
		$btn.attr('href', 'https://www.google.com/maps?q=' + encodeURIComponent(lat + ',' + lon));
		$btn.removeClass('disabled');
	}else{
		$btn.attr('href', '#!');
		$btn.addClass('disabled');
	}
}

jQuery(document).on('change', '#grupo_pri', function(){
	syncGrupoLegislacion();
});

jQuery(document).on('input', '#gps_latitud, #gps_longitud', function(){
	syncGoogleMapsButton();
});

function buildMedicionesTab4(camposData, medicionesData){
	var html = '';
	var mediciones = {};
	try {
		mediciones = (medicionesData && typeof medicionesData === 'object') ? medicionesData : {};
	} catch(err) {
		mediciones = {};
	}

	html += '<div class="row">' +
		'<div class="col s12"><h5>Mediciones</h5></div>' +
	'</div>';

	// Campos de base de datos
	$.each(camposData || [], function(idx, campo){
		if(campo.tipo !== 'MEDIDAS') return;
		
		var nombreCampo = campo.nombre || '';
		var abrev = campo.abrev || '';
		var dataType = campo.data_type || 'NUMERO';
		var valor = (mediciones[nombreCampo] && mediciones[nombreCampo].valor) ? mediciones[nombreCampo].valor : '';
		var unidad = (mediciones[nombreCampo] && mediciones[nombreCampo].unidad) ? mediciones[nombreCampo].unidad : (campo.unidad || '');

		html += '<div class="row" style="margin-bottom: 10px;" data-medicion-nombre="' + nombreCampo + '">' +
			'<div class="input-field col s6">';

		if(dataType === 'NUMERO'){
			html += '<input type="number" class="medicion_valor" data-medicion-nombre="' + nombreCampo + '" value="' + (valor || '') + '">' +
				'<label class="active">' + nombreCampo + '</label>';
		} else if(dataType === 'TEXTO NORMAL'){
			html += '<input type="text" class="medicion_valor" data-medicion-nombre="' + nombreCampo + '" value="' + (valor || '') + '">' +
				'<label class="active">' + nombreCampo + '</label>';
		} else if(dataType === 'CHECKBOX'){
			html += '<p><label><input type="checkbox" class="medicion_valor" data-medicion-nombre="' + nombreCampo + '" ' + (valor ? 'checked' : '') + '><span>' + nombreCampo + '</span></label></p>';
		}

		html += '</div>' +
			'<div class="input-field col s6">' +
			'<input type="text" class="medicion_unidad" data-medicion-nombre="' + nombreCampo + '" value="' + (unidad || '') + '" placeholder="Ej: kg, m, ohm">' +
			'<label class="active">Unidad</label>' +
			'</div>' +
		'</div>';
	});

	html += '<div class="row">' +
		'<div class="col s12">' +
		'<button type="button" id="add_medicion_personalizada" class="btn waves-effect waves-light green"><i class="material-icons left">add</i>Agregar medida personalizada</button>' +
		'</div>' +
	'</div>';

	html += '<div id="mediciones_personalizadas"></div>';

	return html;
}

function addMedicionPersonalizada(){
	var $container = $('#mediciones_personalizadas');
	var rowCount = $container.find('.medicion_personalizada_row').length;
	var html = '<div class="medicion_personalizada_row row" style="margin-bottom: 10px;" data-medicion-idx="' + rowCount + '">' +
		'<div class="input-field col s6">' +
		'<input type="text" class="medicion_personalizada_nombre" placeholder="Nombre de medida">' +
		'<label class="active">Nombre</label>' +
		'</div>' +
		'<div class="input-field col s3">' +
		'<input type="number" class="medicion_personalizada_valor" placeholder="Valor">' +
		'<label class="active">Valor</label>' +
		'</div>' +
		'<div class="input-field col s2">' +
		'<input type="text" class="medicion_personalizada_unidad" placeholder="Unidad">' +
		'<label class="active">Unidad</label>' +
		'</div>' +
		'<div class="col s1" style="margin-top: 20px;">' +
		'<a class="btn-floating btn-small waves-effect waves-light red remove-medicion-personalizada"><i class="material-icons">close</i></a>' +
		'</div>' +
	'</div>';
	$container.append(html);
}

jQuery(document).on('click', '#add_medicion_personalizada', function(e){
	e.preventDefault();
	addMedicionPersonalizada();
});

jQuery(document).on('click', '.remove-medicion-personalizada', function(e){
	e.preventDefault();
	$(this).closest('.medicion_personalizada_row').remove();
});

function serializeMediciones(){
	var mediciones = {};
	
	// Mediciones de base de datos
	$('#mediciones_container .row[data-medicion-nombre]').each(function(){
		var nombre = $(this).data('medicion-nombre');
		var valor = $(this).find('.medicion_valor').val();
		var unidad = $(this).find('.medicion_unidad').val();
		
		if(valor !== '' && valor !== undefined && valor !== null){
			mediciones[nombre] = {
				valor: valor,
				unidad: unidad || ''
			};
		}
	});
	
	// Mediciones personalizadas
	$('.medicion_personalizada_row').each(function(){
		var nombre = $(this).find('.medicion_personalizada_nombre').val();
		var valor = $(this).find('.medicion_personalizada_valor').val();
		var unidad = $(this).find('.medicion_personalizada_unidad').val();
		
		if(nombre && valor){
			mediciones[nombre] = {
				valor: valor,
				unidad: unidad || ''
			};
		}
	});
	
	return mediciones;
}

function savePrimera(){
	var frm = $('#informe_frm_editar');
	if(!frm.length){
		modalError('ERROR', 'Formulario no encontrado', false, 'Cerrar', 'error');
		return;
	}

	var id = $('#id_bbdd').val();
	var mediciones = serializeMediciones();

	// Datos básicos del informe
	var data = {
		id: id,
		fecha_inspeccion: $('#fecha_inspeccion').val(),
		hora_ini: $('#hora_ini').val(),
		hora_fin: $('#hora_fin').val(),
		gps_latitud: $('#gps_latitud').val(),
		gps_longitud: $('#gps_longitud').val(),
		grupo: $('#grupo_pri').val(),
		legislacion: $('#legislacion_pri').val()
	};

	// Guardar informe (si existe servicio)
	$.ajax({
		url: 'services/primeras_new.php',
		type: 'POST',
		data: data,
		success: function(response){
			// Guardar mediciones
			if(Object.keys(mediciones).length > 0 || true){
				$.ajax({
					url: 'services/mediciones.php',
					type: 'POST',
					data: {
						action: 'save',
						id_informe: id,
						medidas_json: JSON.stringify(mediciones)
					},
					success: function(response){
						var resp = JSON.parse(response);
						if(resp.success){
							modalError('ÉXITO', 'Informe guardado correctamente', false, 'Cerrar', 'success');
							$('#modal_pri').modal('close');
							readInformes('pri', { filtro_total: 15 });
						} else {
							modalError('ERROR', resp.error || 'Error al guardar mediciones', false, 'Cerrar', 'error');
						}
					},
					error: function(){
						modalError('ERROR', 'Error al guardar mediciones', false, 'Cerrar', 'error');
					}
				});
			} else {
				modalError('ÉXITO', 'Informe guardado correctamente', false, 'Cerrar', 'success');
				$('#modal_pri').modal('close');
				readInformes('pri', { filtro_total: 15 });
			}
		},
		error: function(){
			modalError('ERROR', 'Error al guardar informe', false, 'Cerrar', 'error');
		}
	});
}

// Click en guardar informe
$(document.body).on("click", "#pri_save", function(){
	modalConfirm("Guardar cambios en informe", "¿Estás seguro de que quieres guardar los cambios?\n\n", false, "Guardar", "Cancelar", "save", "clear", function(){
		savePrimera(); // acción de guardar
	}, function(){ 
		console.log('Accion cancelar: no se han guardado los cambios');
	});
}); // end click en guardar informe


// Filtros de informe
jQuery(document).on("keydown", "#tab_pri [id*=filtro_pri]", function(e){
	// Mostrar botón limpiar cuando se escribe
	jQuery("#filtrar_pri_clear").removeClass("hide");
	// Si se pulsa Enter, ejecutar búsqueda
	if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
		e.preventDefault();
		jQuery(this).parents("#tab_pri").find("#filtrar_pri").click();
	}
});

jQuery(document).on("click", "#filtrar_pri", function() {
  var total = jQuery(this).parents("#tab_pri").find("#filtro_pri_total").val();
  if((parseInt(total)>=1)){
	  var nombre = jQuery(this).parents("#tab_pri").find("#filtro_pri_nombre").val();
	  var direccion = jQuery(this).parents("#tab_pri").find("#filtro_pri_direccion").val();
	  var localidad = jQuery(this).parents("#tab_pri").find("#filtro_pri_localidad").val();
	  var rae = jQuery(this).parents("#tab_pri").find("#filtro_pri_rae").val();
	  var fechaini = jQuery(this).parents("#tab_pri").find("#filtro_pri_fechainicio").val();
	  var fechafin = jQuery(this).parents("#tab_pri").find("#filtro_pri_fechafin").val();
 	  var pendientes = jQuery(this).parents("#tab_pri").find("#filtro_pri_pendiente").is(":checked");
	  var filtros = {
	  	filtro_total : total,
	  	filtro_nombre : nombre,
	  	filtro_direccion : direccion,
	  	filtro_localidad : localidad,
			filtro_rae : rae,
			filtro_fecha_inicio : fechaini,
			filtro_fecha_fin : fechafin,
			filtro_pendientes: pendientes
	  };
	  var tipo = "pri";
		readInformes(tipo, filtros);
  }else{
    modalError("ERROR","Hay que introducir un número mínimo de resultados esperados! Para ello introduce un valor en el campo registros, dentro del módulo de filtros.", false);
  }
});

var openInforme = function(seccion, cual, id){
	if(cual=="frm_editpri"){
		// Realizar la petición HTTP a la API
		var totalParams = {
			filtro_id : id
		}
		$.ajax({
			url: 'services/primeras.php',
			type: 'POST',
			data: totalParams,
			success: function(data) {
				// Recorrer los datos devueltos por la consulta
				var item = JSON.parse(data)["resultados"][0];
				$.ajax({
					url: 'services/legislacion.php',
					type: 'POST',
					data: { action: 'list', filtro_total: 500 },
					success: function(legData) {
						var legislaciones = [];
						try {
							legislaciones = JSON.parse(legData).resultados || [];
						} catch(err) {
							legislaciones = [];
						}
						
						// Cargar campos MEDIDAS
						$.ajax({
							url: 'services/campos.php',
							type: 'POST',
							data: { action: 'list', filtro_total: 500 },
							success: function(camposData) {
								var campos = [];
								try {
									campos = JSON.parse(camposData).resultados || [];
								} catch(err) {
									campos = [];
								}
								
								// Cargar mediciones existentes
								$.ajax({
									url: 'services/mediciones.php',
									type: 'POST',
									data: { action: 'get', id_informe: id },
									success: function(medData) {
										var mediciones = {};
										try {
											var resp = JSON.parse(medData);
											mediciones = (resp.medidas_json && typeof resp.medidas_json === 'object') ? resp.medidas_json : {};
										} catch(err) {
											mediciones = {};
										}
				dataLayer.push({
			    	"event" : "service",
			    	"type" : "get_pri",
			    	"data" : item
			    });
				console.log(item);
				var title = " Editar informe " + item.informe + "| RAE: "+item.contratada.cliente.rae;
					$("#modal_"+seccion).find(".modal_txt_title").text(title);
					$("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
					$("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");
					var frm_tabs = '<ul class="tabs modalEditar">' + 
						'<li class="tab col s3"><a class="tablink1" href="#tab1_pri" title="Datos"><i class="material-icons left">looks_one</i></a></li>' + 
						'<li class="tab col s3"><a class="active tablink2" href="#tab2_pri" title="Instalación"><i class="material-icons left">business</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink3" href="#tab3_pri" title="Ascensor"><i class="material-icons left">code</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink4" href="#tab4_pri" title="Mediciones realizadas"><i class="material-icons left">assignment</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink5" href="#tab5_pri" title="Checking"><i class="material-icons left">assignment_returned</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink6" href="#tab6_pri" title="Defectos detectados"><i class="material-icons left">assignment_late</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink7" href="#tab7_pri" title="Equipos"><i class="material-icons left">business_center</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink8" href="#tab8_pri" title="Resultado"><i class="material-icons left">assignment_turned_in</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink9" href="#tab9_pri" title="Firma"><i class="material-icons left">edit</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink10" href="#tab10_pri" title="Fotos"><i class="material-icons left">photo_camera</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink11" href="#tab11_pri" title="Otros"><i class="material-icons left">settings</i></a></a></li>' + 
					'</ul>';
					var frm_render = '<form id="informe_frm_editar">' + 
						'<div id="tab1_pri" class="col s12">' + 
						'<div class="row">' +
						  '<div class="input-field col s4">' +
						    '<input type="text" id="id_bbdd" name="id_bbdd" value="' + item.id + '" disabled>' +
						    '<label for="id_bbdd" class="active">ID BBDD</label>' +
						  '</div>' +
						  '<div class="input-field col s4">' +
						    '<input type="text" id="num_informe" name="num_informe" value="' + item.informe + '" disabled>' +
						    '<label for="num_informe" class="active">Núm. Informe</label>' +
						  '</div>' +
						  '<div class="input-field col s4">' +
						    '<input type="text" id="inspector" name="inspector" value="' + item.usuario + '" disabled>' +
						    '<label for="inspector" class="active">Inspector</label>' +
						  '</div>' +
						'</div>' +
						'<div class="row">' +
						  '<div class="input-field col s4">' +
						    '<input type="date" id="fecha_inspeccion" name="fecha_inspeccion" value="' + item.fecha + '">' +
						    '<label for="fecha_inspeccion" class="active">Fecha Inspección</label>' +
						  '</div>' +
						  '<div class="input-field col s4">' +
						    '<input type="time" id="hora_ini" name="hora_ini" value="' + item.hora_ini + '">' +
						    '<label for="hora_ini" class="active">Hora inicio</label>' +
						  '</div>' +
						  '<div class="input-field col s4">' +
						    '<input type="time" id="hora_fin" name="hora_fin" value="' + item.hora_fin + '">' +
						    '<label for="hora_fin" class="active">Hora fin</label>' +
						  '</div>' +
						'</div>' +
						'<div class="row">' +
						  '<div class="input-field col s4">' +
						    '<input type="text" id="gps_latitud" name="gps_latitud" value="' + item.gps_latitud + '">' +
						    '<label for="gps_latitud" class="active">GPS lat</label>' +
						  '</div>' +
						  '<div class="input-field col s4">' +
						    '<input type="text" id="gps_longitud" name="gps_longitud" value="' + item.gps_longitud + '">' +
						    '<label for="gps_longitud" class="active">GPS long</label>' +
						  '</div>' +
						  '<div class="col s4" style="margin-top: 20px;">' +
						    '<a id="open_google_maps_pri" class="btn waves-effect waves-light blue' + ((item.gps_latitud && item.gps_longitud) ? '' : ' disabled') + '" href="' + ((item.gps_latitud && item.gps_longitud) ? ('https://www.google.com/maps?q=' + encodeURIComponent(item.gps_latitud + ',' + item.gps_longitud)) : '#!') + '" target="_blank" rel="noopener noreferrer"><i class="material-icons left">map</i>Maps</a>' +
						  '</div>' +
						'</div>' +
						'</div>' +	
						'<div id="tab2_pri" class="active col s12">' +  
						  '<div class="row">' +
						    '<div class="input-field col s12">' +
						      '<select id="grupo_pri" name="grupo">' + buildGrupoOptions(legislaciones, item.grupo || '') + '</select>' +
						      '<label>Grupo</label>' +
						    '</div>' +
						  '</div>' +
						  '<div class="row">' +
						    '<div class="input-field col s12">' +
						      '<input type="text" id="legislacion_pri" name="legislacion" value="' + (item.legislacion || '') + '" readonly>' +
						      '<label for="legislacion_pri" class="active">Legislación</label>' +
						    '</div>' +
						  '</div>' +
						'</div>' +	
						'<div id="tab3_pri" class="col s12">' + 	    
						'</div>' +	
						'<div id="tab4_pri" class="col s12">' + 
						'<div id="mediciones_container"></div>' +
						'</div>' +	
						'<div id="tab5_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab6_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab7_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab8_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab9_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab10_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab11_pri" class="col s12">' + 
						'</div>' +	
 					'</form>';
				  $("#modal_"+seccion).find(".contentTabs").html(frm_tabs);
				  $("#modal_"+seccion).find(".contentForm").html(frm_render);
				  $("#modal_"+seccion).find('.tabs').tabs();
				  $("#modal_"+seccion).find('select').formSelect();
				  
				  // Renderizar mediciones
				  var medicionesHtml = buildMedicionesTab4(campos, mediciones);
				  $('#mediciones_container').html(medicionesHtml);
				  
				  // Materialize labels
				  Materialize.updateTextFields();
				  
				  syncGrupoLegislacion();
				  syncGoogleMapsButton();
				  $("#modal_"+seccion).modal({
						dismissible: false
					});
					// Abrir modal
					$("#modal_"+seccion).modal("open");
										},
										error: function() {
											modalError('ERROR', 'Error cargando mediciones.', false, 'Cerrar', 'error');
										}
									});
								},
								error: function() {
									modalError('ERROR', 'Error cargando campos para mediciones.', false, 'Cerrar', 'error');
								}
							});
						},
						error: function() {
							modalError('ERROR', 'Error cargando legislaciones para el formulario.', false, 'Cerrar', 'error');
						}
				});
			},
			error: function(xhr, status, error) {
				// Mostrar un mensaje de error en el centro de la pantalla
				$('#app-content div#error').html(error);
				$('#app-content div#error').show();
			}			
		});
	};
}

// Limpiar filtros de contratadas
jQuery(document).on("click", "#filtrar_pri_clear", function() {
	jQuery(this).addClass("hide");
	jQuery(this).parents("#tab_pri").find("#filtro_pri_nombre").val('');
	jQuery(this).parents("#tab_pri").find("#filtro_pri_direccion").val('');
	jQuery(this).parents("#tab_pri").find("#filtro_pri_localidad").val('');
	jQuery(this).parents("#tab_pri").find("#filtro_pri_rae").val('');	
	jQuery(this).parents("#tab_pri").find("#filtro_pri_fechainicio").val('');	
	jQuery(this).parents("#tab_pri").find("#filtro_pri_fechafin").val('');	
	jQuery(this).parents("#tab_pri").find("label").not(":eq(0)").removeClass("active");
	jQuery(this).parents("#tab_pri").find("#filtro_pri_total").val('15');	
	jQuery(this).parents("#tab_pri").find("#filtro_pri_pendiente").prop("checked", false);
	jQuery(this).parents("#tab_pri").find("#filtrar_pri").click();
});