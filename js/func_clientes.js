// Funciones relacionadas con la pestaña de clientes
var readClientes = function(id, totalParams){
	// limpiamos la tabla de clientes
	$("#table_cli tbody").empty();
	// Realizar la petición HTTP a la API
	$.ajax({
		url: 'services/clientes.php',
		type: 'POST',
		data: totalParams,
		success: function(data) {
				$("span.direct").html('');
		    // Recorrer los datos devueltos por la consulta
		    datos = JSON.parse(data)["resultados"];
		    dataLayer.push({
		    	"event" : "service",
		    	"type" : "list_cli",
		    	"data" : datos
		    });
		    mantenedores = JSON.parse(data)["mantenedores"];
		    var totalResultados = 0;
		    $.each(datos, function(index, item) {
		      // Construir la fila de la tabla con los datos
		      var tableRow = "<tr>" +
		        "<td class='ancho50'>&nbsp;</td>" +
		        "<td class='ancho75'>" + item.rae + "</td>" +
		        "<td class='ancho50'>" +
		          "<a seccion='cli' tipo='frm_editcli' data-id='" + item.id + "' class='editar_cli btn-floating btn-small waves-effect waves-light green' title='Editar cliente'>" +
		            "<i class='material-icons'>edit</i>" +
		          "</a>&nbsp;" +
		        "</td>" +
		        "<td><span class='main-text'>" + item.nombre + "</span><br><span class='secondary-text'>" + item.direccion + "</span></td>" +
		        "<td class='ancho75'>" + item.cp + "</td>" +
		        "<td>" + item.localidad + "</td>" +
		        "<td class='ancho200'>" + item.mantenedor + "</td>" +
		        "<td class='ancho150'>" + item.vencimiento_dmy + "</td>" +
		        "<td class='ancho150'>";
		        if(item.email!=""){
		          tableRow += "<a class='btn-floating btn-small waves-effect waves-light black' title='Enviar email: " + item.email + "' href='mailto:" + item.email + "'>" +
		            "<i class='material-icons'>email</i>" +
		          "</a>&nbsp;";
		        }else{
		          tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light black' title='Sin email' href=''>" +
		            "<i class='material-icons'>email</i>" +
		          "</a>&nbsp;";		        	
		        }
		        if(item.telefono!=""){
		        	tableRow += "<a class='btn-floating btn-small waves-effect waves-light black' title='Llamar a: " + item.telefono + "' href='tel:" + item.telefono + "'>" +
		            "<i class='material-icons'>local_phone</i>" +
		          "</a>&nbsp;";
		        }else{
		        	tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light grey' title='Llamar a: " + item.telefono + "' href='tel:" + item.telefono + "'>" +
		            "<i class='material-icons'>local_phone</i>" +
		          "</a>&nbsp;";
		        }
		        if(item.id_administrador!=0){
		        	tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Administrador: "+ item.quien_contrata +"' href=''>" +
		            "<i class='material-icons'>home</i>" +
		          "</a>";
		        }else{
		        	tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light grey' title='' href=''>" +
		            "<i class='material-icons'>home</i>" +
		          "</a>";
		        }
		          tableRow += "</td>" +
		        "<td class='ancho50'>" +
	          "<a class='more_cli btn-floating btn-small waves-effect waves-light red' title='Más' data-id='" + item.id + "'>" +
		            "<i class='material-icons'>more_vert</i>" +
		          "</a>" +
		        "</td>" +
		      "</tr>";

		      // Agregar la fila a la tabla
		      $("#table_cli").append(tableRow);
		      totalResultados++;
		    });

		    // Crear la fila que muestra el total de resultados
			var totalRow = "<span class='main-text'>Total de resultados:</span> <span class='secondary-text'>" + totalResultados + "</span>";
			// Agregar la fila a la tabla
			$("#resultados_cli").html(totalRow);

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

var readDatosFacturacion = function(id){
	// vaciamos la tabla
	$("#table_cli_fact tbody").empty();
	$("#resultados_facturacion").html('Cargando...');
	$.ajax({
		url: 'services/datos_facturacion.php',
		type: 'POST',
		data: { filtro_id_cliente: id },
		success: function(data) {
			if(typeof data === 'string' && data.trim() === 'KO'){
				$("#resultados_facturacion").html('No hay datos');
				return;
			}
			var parsed = JSON.parse(data);
			var datos = parsed["resultados"] || [];
			if(!datos || datos.length === 0){
				$("#resultados_facturacion").html('No hay datos');
				return;
			}

			var total = 0;
			datos.forEach(function(row){
				var tr = '<tr>';
				tr += '<td>';
				tr += '<b>' + row['fis_nombre'] + '</b><br>';
				tr += '' + row['fis_direccion'] + ' ';
				tr += '' + row['fis_cp'] + ' ';
				tr += '' + row['fis_localidad'] + ' ';
				tr += '(' + row['fis_provincia'] + ')<br>';
				tr += '<b>Observaciones:</b> ' + row['observaciones'] + '<br>&nbsp;';
				tr += '</td>';
				tr += '<td><b>Tarifa:</b><br>' + row['tarifa'] + '<br><b>Forma de pago:</b><br>' + row['forma_pago'] + '</td>';
				tr += '<td><b>Núm. cuenta:</b><br>' + row['num_cuenta'] + '<br><b>CIF:</b><br>' + row['cif'] + '</td>';
				tr += '<td><a seccion="cli" tipo="frm_edit_fac" data-id="' + row['id'] + '" class="editar_cli_fac btn-floating btn-small waves-effect waves-light red" title="Eliminar datos"><i class="material-icons">delete_forever</i></a></td>';
				tr += '</tr>';
				$("#table_cli_fact tbody").append(tr);
				total++;
			});
			$("#resultados_facturacion").html('Total: ' + total);
		},
		error: function(xhr, status, error) {
			$("#resultados_facturacion").html('Error: ' + error);
		}
	});
}

// Leer historial de comentarios para el cliente
var readHistorial = function(id){
	$("#table_historial").empty();
	$("#resultados_historial").html('Cargando...');
	$.ajax({
		url: 'services/historial.php',
		type: 'POST',
		data: { filtro_id_cliente: id },
		success: function(data){
			try{
				var parsed = (typeof data === 'string') ? JSON.parse(data) : data;
			}catch(e){
				$("#resultados_historial").html('Error parseando respuesta');
				return;
			}
			var datos = parsed['resultados'] || [];
			if(!datos || datos.length === 0){
				$("#resultados_historial").html('No hay historial');
				return;
			}
			var total = 0;
			datos.forEach(function(row){
				var fecha = row['fecha'];
				var quien = row['usuario'];
				var comentario = row['comentario'];
				var tr = '<tr>';
				tr += '<td><b>' + (fecha ? fecha : '') + ' ' + (quien ? ('(' + quien + ')') : '') + '</b><br>' + comentario + '</td>';
				tr += '</tr>';
				$("#table_historial").append(tr);
				total++;
			});
			$("#resultados_historial").html('Total: ' + total);
		},
		error: function(xhr, status, error){
			$("#resultados_historial").html('Error: ' + error);
		}
	});
}

var readContratadasClientes = function(id){
	// vaciamos la tabla y mostramos estado
	$("#table_cli_con tbody").empty();
	$("#resultados_cli_con").html('Cargando...');
	// Realizar la petición HTTP a la API
	$.ajax({
		url: 'services/contratadas.php',
		type: 'POST',
		data: { filtro_id_cliente: id },
		success: function(data) {
			if(typeof data === 'string' && data.trim() === 'KO'){
				$("#resultados_cli_con").html('No hay datos');
				return;
			}
			var parsed = JSON.parse(data);
			var datos = parsed["resultados"] || [];
			if(!datos || datos.length === 0){
				$("#resultados_cli_con").html('No hay datos');
				return;
			}
			var total = 0;
			datos.forEach(function(row){
				var contratada = row["cliente"]["contratada"] || {};
				var fecha = contratada['fecha'] || '';
				var num_control = contratada['num_control'] || '';
				var usuario = contratada['usuario'] || '';
				var estado = contratada['estado'] || '';
				estado = (estado==0) ? 'Inicial' : estado;
				estado = (estado==1) ? 'Abierta' : estado;
				estado = (estado==2) ? 'Finalizada' : estado;

				var tr = '<tr>';
				tr += '<td>' + (fecha || '') + '</td>';
				tr += '<td>' + (num_control || '') + '</td>';
				tr += '<td>' + (usuario || '') + '</td>';
				tr += '<td>' + (estado || '') + '</td>';
				tr += '<td><a class="btn-floating btn-small waves-effect waves-light grey" title="Abrir en otra pestaña"><i class="material-icons">open_in_new</i></a></td>';
				tr += '</tr>';

				$("#table_cli_con tbody").append(tr);
				total++;
			});
			$("#resultados_cli_con").html('Total: ' + total);
		},
		error: function(xhr, status, error) {
			$("#resultados_cli_con").html('Error: ' + error);
		}
	});
}

// Renderiza el formulario para añadir un comentario al historial
var renderFormHistorial = function(clientId){
	var html = '';
	html += '<form id="form_historial">';
	html += '<input type="hidden" id="hist_id_cliente" value="' + clientId + '">';
	html += '<div class="input-field"><textarea id="hist_comentario" class="materialize-textarea" name="comentario"></textarea><label for="hist_comentario">Comentario</label></div>';
	html += '<div class="input-field">' +
				'<button type="button" id="btn_save_hist" class="waves-effect waves-light btn green"><i class="material-icons left">add</i>Crear</button>&nbsp;' +
				'<button type="button" id="btn_cancel_hist" class="waves-effect waves-light btn red"><i class="material-icons left">cancel</i>Cancelar</button>' +
			'</div>';
	html += '</form>';
	$('#frm_historial').html(html);
}

// Guardar comentario historial
jQuery(document).on('click', '#btn_save_hist', function(e){
	e.preventDefault();
	var payload = {
		id_cliente: $('#hist_id_cliente').val(),
		comentario: $('#hist_comentario').val()
	};
	payload.id_cliente = parseInt(payload.id_cliente,10) || 0;
	payload.comentario = (payload.comentario || '').trim();
	if(payload.id_cliente <= 0){ modalError('ERROR','ID cliente no disponible',false); return; }
	if(!payload.comentario){ modalError('ERROR','Comentario vacío',false); return; }
	$.ajax({
		url: 'services/historial_new.php',
		type: 'POST',
		data: payload,
		success: function(data){
			if(typeof data === 'string' && data.trim() === 'OK'){
				readHistorial(payload.id_cliente);
				$('#frm_historial').empty();
			}else{
				modalError('ERROR','No se pudo guardar: ' + data, false);
			}
		},
		error: function(xhr,status,error){
			modalError('ERROR','Error en la petición: ' + error, false);
		}
	});
});

// Cancelar formulario historial
jQuery(document).on('click', '#btn_cancel_hist', function(e){
	e.preventDefault();
	$('#frm_historial').empty();
});

// Botones nuevo/refresh historial
jQuery(document).on('click', '#btn_new_hist', function(e){
	e.preventDefault();
	var cid = $(this).data('id') || $('#id_cli').val();
	if(!cid){ modalError('ERROR','ID cliente no disponible',false); return; }
	renderFormHistorial(cid);
});

jQuery(document).on('click', '#btn_refresh_hist', function(e){
	e.preventDefault();
	var cid = $(this).data('id') || $('#id_cli').val();
	if(cid) readHistorial(cid);
});

jQuery(document).on('click', '#btn_refresh_cli_con', function(e){
	e.preventDefault();
	var cid = $(this).data('id');
	if(cid) readContratadasClientes(cid);
});
// Renderiza el pequeño formulario para añadir nuevos datos de facturación
var renderFormDatosFacturacion = function(clientId){
	var html = '';
	html += '<form id="form_datos_fact">';
	html += '<input type="hidden" id="fact_id_cliente" value="' + clientId + '">';
	html += '<div class="input-field"><input type="text" id="fact_titular" name="titular"><label for="fact_titular">Titular</label></div>';
	html += '<div class="input-field"><input type="text" id="fact_direccion" name="direccion"><label for="fact_direccion">Dirección</label></div>';
	html += '<div class="input-field"><input type="text" id="fact_localidad" name="localidad"><label for="fact_localidad">Localidad</label></div>';
	html += '<div class="input-field"><input type="text" id="fact_provincia" name="provincia"><label for="fact_provincia">Provincia</label></div>';
	html += '<div class="input-field"><input type="text" id="fact_cp" name="cp"><label for="fact_cp">C.P.</label></div>';
	html += '<div class="input-field"><input type="text" id="fact_cif" name="cif"><label for="fact_cif">CIF</label></div>';
	html += '<div class="input-field"><input type="text" id="fact_num_cuenta" name="num_cuenta"><label for="fact_num_cuenta">Núm. cuenta</label></div>';
	html += '<div class="input-field"><textarea id="fact_observaciones" class="materialize-textarea" name="observaciones"></textarea><label for="fact_observaciones">Observaciones</label></div>';
	html += '<div class="input-field botonesFormEdit">' +
				'<button type="button" id="btn_save_fact" class="waves-effect waves-light btn green"><i class="material-icons left">add</i>Crear</button>&nbsp;' +
				'<button type="button" id="btn_cancel_fact" class="waves-effect waves-light btn red"><i class="material-icons left">cancel</i>Cancelar</button>' +
			'</div>';
	html += '</form>';
	$('#frm_datos_facturacion').html(html);
}
// Validación auxiliar: validar IBAN / número de cuenta
function isValidIBAN(iban){
	if(!iban) return false;
	var s = iban.replace(/[^A-Za-z0-9]/g,'').toUpperCase();
	if(!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(s)) return false;
	// move first 4 chars to the end
	s = s.slice(4) + s.slice(0,4);
	// expand letters to numbers (A=10 ... Z=35)
	var expanded = '';
	for(var i=0;i<s.length;i++){
		var ch = s.charAt(i);
		if(ch >= 'A' && ch <= 'Z'){
			expanded += (ch.charCodeAt(0) - 55);
		}else{
			expanded += ch;
		}
	}
	// compute mod 97 iteratively
	var remainder = 0;
	for(var j=0;j<expanded.length;j++){
		remainder = (remainder * 10 + parseInt(expanded.charAt(j), 10)) % 97;
	}
	return remainder === 1;
}

function isValidAccountNumber(acct){
	if(!acct) return false;
	var s = String(acct).replace(/[^A-Za-z0-9]/g,'').toUpperCase();
	// if looks like IBAN (starts with 2 letters and 2 digits) validate IBAN
	if(/^[A-Z]{2}[0-9]{2}/.test(s)){
		return isValidIBAN(s);
	}
	// otherwise validate as numeric account (8-34 digits)
	return (/^[0-9]{8,34}$/.test(s));
}

// Envío del formulario para crear nuevos datos de facturación
jQuery(document).on('click', '#btn_save_fact', function(e){
	e.preventDefault();
	var payload = {
		id_cliente: $('#fact_id_cliente').val(),
		titular: $('#fact_titular').val().toUpperCase(),
		direccion: $('#fact_direccion').val().toUpperCase(),
		localidad: $('#fact_localidad').val().toUpperCase(),
		provincia: $('#fact_provincia').val().toUpperCase(),
		cp: $('#fact_cp').val(),
		cif: $('#fact_cif').val(),
		num_cuenta: $('#fact_num_cuenta').val(),
		observaciones: $('#fact_observaciones').val()
	};
		// validación mejorada
		payload.id_cliente = parseInt(payload.id_cliente, 10) || 0;
		payload.titular = (payload.titular || '').trim();
		payload.direccion = (payload.direccion || '').trim();
		payload.localidad = (payload.localidad || '').trim();
		payload.cp = (payload.cp || '').trim();
		payload.cif = (payload.cif || '').trim();
		payload.num_cuenta = (payload.num_cuenta || '').trim();

		var errors = [];
		if(payload.id_cliente <= 0) errors.push('ID cliente no válido');
		if(!payload.titular) errors.push('Titular requerido');
		if(!payload.direccion) errors.push('Dirección requerida');
		if(!payload.localidad) errors.push('Localidad requerida');
		// Código postal: 5 dígitos (España)
		if(!/^[0-9]{5}$/.test(payload.cp)) errors.push('C.P. inválido (5 dígitos)');
		// CIF/NIF básico: longitud razonable (validación completa opcional)
		if(payload.cif.length < 4 || payload.cif.length > 20) errors.push('CIF/NIF inválido');
		// Número de cuenta: aceptar IBAN o BBAN (comprobación IBAN incluida)
		if(!isValidAccountNumber(payload.num_cuenta)) errors.push('Núm. cuenta inválido (IBAN o 8-34 dígitos)');

		if(errors.length){
			modalError('ERROR','Corrige los siguientes errores:<br>' + errors.join('<br>'), false);
			return;
		}
	$.ajax({
		url: 'services/datos_facturacion_new.php',
		type: 'POST',
		data: payload,
		success: function(data){
			if(typeof data === 'string' && data.trim() === 'OK'){
				readDatosFacturacion(payload.id_cliente);
				$('#frm_datos_facturacion').empty();
			}else{
				modalError('ERROR','No se pudo guardar: ' + data, false);
			}
		},
		error: function(xhr, status, error){
			modalError('ERROR','Error en la petición: ' + error, false);
		}
	});
});

// Filtros de cliente
jQuery(document).on("keydown", "#tab_cli [id*=filtro_cli]", function(e){
	// Mostrar botón limpiar cuando se escribe
	jQuery("#filtrar_cli_clear").removeClass("hide");
	// Si se pulsa Enter, ejecutar búsqueda
	if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
		e.preventDefault();
		jQuery(this).parents("#tab_cli").find("#filtrar_cli").click();
	}
});

// botón recargar facturación en editar cliente
jQuery(document).on("click", "#btn_refresh_fact", function(e){
	e.preventDefault();
	var cid = $(this).data('id');
	if(cid) readDatosFacturacion(cid);
});

// Mostrar el formulario de nuevos datos al pulsar el botón "Nuevo" en facturación
jQuery(document).on('click', '#btn_new_fact', function(e){
	e.preventDefault();
	var cid = $(this).data('id') || $('#id_cli').val();
	if(!cid){ modalError('ERROR','ID cliente no disponible',false); return; }
	renderFormDatosFacturacion(cid);
});

jQuery(document).on('click', '#btn_cancel_fact', function(e){
	e.preventDefault();
	$('#frm_datos_facturacion').empty();
});

// Eliminar registro de datos de facturación (botón borrar por fila)
jQuery(document).on("click", ".editar_cli_fac", function(e){
	e.preventDefault();
	var rowId = $(this).data('id');
	if(!rowId) return;
	modalConfirm("Eliminar datos facturación", "¿Estás seguro de que quieres eliminar estos datos de facturación?", false, "Eliminar", "Cancelar", "delete_forever", "cancel", function(){
		$.ajax({
			url: 'services/datos_facturacion_delete.php',
			type: 'POST',
			data: { id: rowId },
			success: function(data){
				if(typeof data === 'string' && data.trim() === 'OK'){
					$('#modal_confirm').modal('close');
					var cid = $('#id_cli').val();
					if(cid) readDatosFacturacion(cid);
				}else{
					modalError('ERROR', 'No se pudo eliminar: ' + data, false);
				}
			},
			error: function(xhr, status, error){
				modalError('ERROR', 'Error en la petición: ' + error, false);
			}
		});
	}, function(){ /* cancel */ });
});


var contratarCliente = function(clientId, whereFrom){
	// abrir modalConfirm para crear nueva contratacion
	modalConfirm("Contratar cliente", "Se creará una nueva contratación en la base de datos con fecha de hoy", true, "Crear", "Cancelar", "add", "cancel", function(){
		$.ajax({
			url: 'services/contratadas_save.php',
			type: 'POST',
			data: { id_cliente: clientId },
			success: function(data){
				if(typeof data === 'string' && data.trim() === 'OK'){
					$('#modal_confirm').modal('close');
					// refrescar listado de clientes
					if(whereFrom=="form") $('#btn_refresh_cli_con').click();
				}else{
					modalError('ERROR','No se pudo crear la contratación: ' + data, false);
				}
			},
			error: function(xhr,status,error){
				modalError('ERROR','Error en la petición: ' + error, false);
			}
		});
	}, function(){
		console.log("hizo click en cancelar");
	});	
}

// Contratar cliente: abre modalConfirm para crear nueva contratacion
jQuery(document).on("click", "#btn_create_cli_con", function(e){
	e.preventDefault();
	var cid = $(this).data('id');
	if(cid) contratarCliente(cid, "form");	
});

jQuery(document).on("click", "#filtrar_cli", function() {
  var total = jQuery(this).parents("#tab_cli").find("#filtro_cli_total").val();
  if((parseInt(total)>=1)){
	  var nombre = jQuery(this).parents("#tab_cli").find("#filtro_cli_nombre").val();
	  var direccion = jQuery(this).parents("#tab_cli").find("#filtro_cli_direccion").val();
	  var localidad = jQuery(this).parents("#tab_cli").find("#filtro_cli_localidad").val();
	  var cp = jQuery(this).parents("#tab_cli").find("#filtro_cli_cp").val();
	  var rae = jQuery(this).parents("#tab_cli").find("#filtro_cli_rae").val();
	  var fechaini = jQuery(this).parents("#tab_cli").find("#filtro_cli_fechainicio").val();
	  var fechafin = jQuery(this).parents("#tab_cli").find("#filtro_cli_fechafin").val();
	  var filtros = {
	  	filtro_total : total,
	  	filtro_nombre : nombre,
	  	filtro_direccion : direccion,
	  	filtro_localidad : localidad,
	  	filtro_cp : cp,
		filtro_rae : rae,
		filtro_fecha_inicio : fechaini,
		filtro_fecha_fin : fechafin
	  };
	  var tipo = "cli";
		readClientes(tipo, filtros);
  }else{
    modalError("ERROR","Hay que introducir un número mínimo de resultados esperados! Para ello introduce un valor en el campo registros, dentro del módulo de filtros.", false);
  }
});

// Limpiar filtros de cliente
jQuery(document).on("click", "#filtrar_cli_clear", function() {
	jQuery(this).addClass("hide");
	jQuery(this).parents("#tab_cli").find("#filtro_cli_nombre").val('');
	jQuery(this).parents("#tab_cli").find("#filtro_cli_direccion").val('');
	jQuery(this).parents("#tab_cli").find("#filtro_cli_localidad").val('');
	jQuery(this).parents("#tab_cli").find("#filtro_cli_cp").val('');	
	jQuery(this).parents("#tab_cli").find("#filtro_cli_rae").val('');	
	jQuery(this).parents("#tab_cli").find("#filtro_cli_fechainicio").val('');	
	jQuery(this).parents("#tab_cli").find("#filtro_cli_fechafin").val('');	
	jQuery(this).parents("#tab_cli").find("label").not(":eq(0)").removeClass("active");
	jQuery(this).parents("#tab_cli").find("#filtro_cli_total").val('15');	
	jQuery(this).parents("#tab_cli").find("#filtrar_cli").click();
}); // end limpiar filtros de cliente

// Menú contextual para cada fila (ocultar visualmente la fila)
jQuery(document).on("click", ".more_cli", function(e){
    e.preventDefault();
    // cerrar cualquier menú abierto
    jQuery('.row-menu').remove();

    var $btn = jQuery(this);
    var itemId = $btn.data('id');
    var offset = $btn.offset();

    var menu = jQuery("<div class='row-menu'><ul><li class='row-menu-hide'>Ocultar fila</li><li class='row-menu-contratar' data-id='" + itemId + "'>Contratar</li><li class='row-menu-cancel'>Cancelar</li></ul></div>");

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
    // evitar que salga por la derecha
    if (desiredLeft + menuW > winW - 6) {
        desiredLeft = winW - menuW - 6;
    }
    // evitar que salga por la izquierda
    if (desiredLeft < 6) {
        desiredLeft = 6;
    }

    // calcular top (por defecto debajo del botón)
    var desiredTop = offset.top + $btn.outerHeight() + 6;
    // si se desborda por abajo, mostrar encima del botón
    if (desiredTop + menuH > winTop + jQuery(window).height()) {
        desiredTop = offset.top - menuH - 6;
        // si aun así sale por arriba, ajustamos al tope visible
        if (desiredTop < winTop + 6) desiredTop = winTop + 6;
    }

    menu.css({ top: desiredTop + 'px', left: desiredLeft + 'px', visibility: 'visible' });

    // acción ocultar
    menu.on('click', '.row-menu-hide', function(ev){
        ev.stopPropagation();
        var $tr = $btn.closest('tr');
        // añadir clase para ocultar visualmente
        $tr.addClass('hidden-row');
        // eliminar el menú
        menu.remove();
    });

    // cancelar
    menu.on('click', '.row-menu-cancel', function(ev){
        ev.stopPropagation();
        menu.remove();
    });

	// contratar desde el menú
	menu.on('click', '.row-menu-contratar', function(ev){
		ev.stopPropagation();
		var cid = jQuery(this).data('id');
		if(cid) contratarCliente(cid, "menu");
		menu.remove();
	});

    // cerrar si se hace click fuera
    setTimeout(function(){
      jQuery(document).on('click.rowMenuClose', function(ev){
        if(jQuery(ev.target).closest('.row-menu').length===0 && jQuery(ev.target).closest('.more_cli').length===0){
          jQuery('.row-menu').remove();
          jQuery(document).off('click.rowMenuClose');
        }
      });
    }, 10);
});

var openCliente = function(seccion, cual, id){
	// formulario edicion cliente
	if(cual=="frm_editcli"){
		// Realizar la petición HTTP a la API
		var totalParams = {
			filtro_id : id
		}
		$.ajax({
			url: 'services/clientes.php',
			type: 'POST',
			data: totalParams,
			success: function(data) {
			    // Recorrer los datos devueltos por la consulta
			    item = JSON.parse(data)["resultados"][0];
			    dataLayer.push({
		    		"event" : "service",
		    		"type" : "view_cli",
		    		"data" : item
		    	});
			    mantenedores = JSON.parse(data)["mantenedores"];
			    var title = "Editar cliente";
			    title+= " - RAE: "+item.rae;
					$("#modal_"+seccion).find(".modal_txt_title").text(title);
					$("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
					$("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");
					var frm_tabs = '<ul class="tabs modalEditar">' + 
						'<li class="tab col s2"><a class="active tablink1" href="#tab1_cli" title="Ascensor"><i class="material-icons left">home</i></a></li>' + 
						'<li class="tab col s2"><a class="tablink2" href="#tab2_cli" title="Ubicación"><i class="material-icons left">location_on</i></a></li>' + 
						'<li class="tab col s2"><a class="tablink3" href="#tab3_cli" title="Contratación"><i class="material-icons left">account_box</i></a></li>' + 
						'<li class="tab col s2"><a class="tablink4" href="#tab4_cli" title="Datos Facturación"><i class="material-icons left">euro_symbol</i></a></li>' + 
						'<li class="tab col s2"><a class="tablink5" href="#tab5_cli" title="Historial"><i class="material-icons left">history</i></a></li>' + 
						'<li class="tab col s2"><a class="tablink6" href="#tab6_cli" title="Comentarios"><i class="material-icons left">message</i></a></li>' + 
						'<li class="tab col s2"><a class="tablink7" href="#tab7_cli" title="Configuración"><i class="material-icons left">settings</i></a></li>' + 
					'</ul>';
					var frm_render = '<form id="cliente_frm_editar">' +
			    '<div id="tab1_cli" class="active col s12">' + 
			    '<div class="input-field anchoFrm4">' +
			      '<input type="text" id="rae_cli" name="rae_cli" value="' + item.rae + '">' +
			      '<label for="rae_cli" class="active">RAE</label>' +
			    '</div>' +
			    '<div class="input-field anchoFrm2">' +
			      '<select id="mantenedor_cli" name="mantenedor_cli">';
			      	for (let clave in mantenedores){
				      	if(item.id_mantenedor==clave){
				      		frm_render += '<option value="'+ clave +'" selected>'+ mantenedores[clave] +'</option>';
				      	}else{
				      		frm_render += '<option value="'+ clave +'">'+ mantenedores[clave] +'</option>';				      	
				      	}
			      	};
			      frm_render+='</select>' + 
			      '<label for="mantenedor_cli">Mantenedor</label>' +
			    '</div>' +	
			    '<div class="input-field anchoFrm4">';
			    if(item.vencimiento!="0000-00-00"){
			    	frm_render+='<input type="date" id="vencimiento_cli" name="vencimiento_cli" value="' + item.vencimiento + '">';
				}else{
					frm_render+='<input type="date" id="vencimiento_cli" name="vencimiento_cli">';
				}
			      frm_render+='<label for="vencimiento_cli" class="active">Vencimiento</label>' +
			    '</div>' +
			    '<div class="input-field anchoFrm4">' +
			      '<input type="number" id="cada_cli" name="cada_cli" value="' + item.cada + '">' +
			      '<label for="cada_cli" class="active">Periodicidad (años)</label>' +
			    '</div>' +	
			    '</div>' +

			    '<div id="tab2_cli" class="active col s12">' + 
				    '<div class="input-field">' +
				      '<input type="text" id="nombre_cli" name="nombre_cli" value="' + item.nombre + '">' +
				      '<label for="nombre_cli" class="active">Titular</label>' +
				    '</div>' +
				    '<div class="input-field">' +
				      '<input type="text" id="direccion_cli" name="direccion_cli" value="' + item.direccion + '">' +
				      '<label for="direccion_cli" class="active">Dirección</label>' +
				    '</div>' +
				    '<div class="input-field anchoFrm4">' +
				      '<input type="text" id="cp_cli" name="cp_cli" value="' + item.cp + '">' +
				      '<label for="cp_cli" class="active">Código Postal</label>' +
				    '</div>' +
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="localidad_cli" name="localidad_cli" value="' + item.localidad + '">' +
				      '<label for="localidad_cli" class="active">Localidad</label>' +
				    '</div>' +   
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="municipio_cli" name="municipio_cli" value="' + item.municipio + '">' +
				      '<label for="municipio_cli" class="active">Municipio</label>' +
				    '</div>' +      	
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="provincia_cli" name="provincia_cli" value="' + item.provincia + '">' +
				      '<label for="provincia_cli" class="active">Provincia</label>' +
				    '</div>' +    
			    '</div>' + 

			    '<div id="tab3_cli" class="col s12">' + 
				    '<div class="input-field anchoFrm2">' +
				    '<input type="text" id="quien_contrata_cli" name="quien_contrata_cli" value="' + item.quien_contrata + '">' +
				    '<label for="quien_contrata_cli" class="active">Quien Contrata</label>' +
				    '</div>' +
				    '<div class="input-field switch">' +
						'<label for="id_administrador_cli" class="active">' +
						'<input type="checkbox" id="id_administrador_cli" name="id_administrador_cli"' + (item.id_administrador == 1 ? 'checked' : '') + ' />' +
						'<span class="lever"></span>Administrador' +
						'</label>' +
				    '</div><br>' +
			    	'<div class="input-field anchoFrm4">' +
			      '<input type="text" id="telefono_cli" name="telefono_cli" value="' + item.telefono + '">' +
			      '<label for="telefono_cli" class="active">Teléfono</label>' +
			      '</div>' +
			    	'<div class="input-field anchoFrm4">' +
			      '<input type="text" id="telefono2_cli" name="telefono2_cli" value="' + item.telefono2 + '">' +
			      '<label for="telefono2_cli" class="active">Teléfono 2</label>' +
			      '</div>' +
			    	'<div class="input-field anchoFrm2">' +
			      '<input type="text" id="email_cli" name="email_cli" value="' + item.email + '">' +
			      '<label for="email_cli" class="active">eMail</label>' +
			      '</div>' +
				    '<div class="input-field">' +
				      '<input type="text" id="observaciones_cli" name="observaciones_cli" value="' + item.observaciones + '">' +
				      '<label for="observaciones_cli" class="active">Observaciones</label>' +
				    '</div>' +    
			    '</div>' +

				'<div id="tab4_cli" class="col s12">' + 
				'<div class="right input-field botonesFormEdit">' +
					'<button type="button" id="btn_new_fact" class="btn-floating waves-effect waves-light orange" title="Nuevos datos">' +
						'<i class="material-icons">add</i>' +
					'</button>&nbsp;' +
					'<button type="button" id="btn_refresh_fact" data-id="' + item.id + '" class="btn-floating waves-effect waves-light blue" title="Actualizar">' +
						'<i class="material-icons">refresh</i>' +
					'</button>' +
				'</div>' +
				'<table id="table_cli_fact" class="highlight">' +
				'<thead>' +
				'<tr>' +
				'<th>Dirección</th>' +
				'<th>Facturación</th>' +
				'<th>Núm cuenta / CIF</th>' +
				'</tr>' +
				'</thead>' +
				'<tbody></tbody>' +
				'</table>' +
				'<div id="resultados_facturacion" class="right-align"></div>' +
				'<div id="frm_datos_facturacion" class="left-align"></div>' +				
				'</div>' +
				'<div id="tab5_cli" class="col s12">' +
					'<div class="right input-field botonesFormEdit">' +
						'<button type="button" id="btn_create_cli_con" data-id="' + item.id + '" class="btn-floating waves-effect waves-light orange" title="Contratar">' +
							'<i class="material-icons">assignment_turned_in</i>' +
						'</button>&nbsp;' +
						'<button type="button" id="btn_refresh_cli_con" data-id="' + item.id + '" class="btn-floating waves-effect waves-light blue" title="Actualizar">' +
							'<i class="material-icons">refresh</i>' +
						'</button>' +
					'</div>' +
					'<table id="table_cli_con" class="highlight">' +
					'<thead>' +
					'<tr>' +
					'<th>Fecha</th>' +
					'<th>Núm. Control</th>' +
					'<th>Usuario</th>' +
					'<th>Estado</th>' +
					'<th></th>' +
					'</tr>' +
					'</thead>' +
					'<tbody></tbody>' +
					'</table>' +
					'<div id="resultados_cli_con" class="right-align"></div>' +
				'</div>' +
				'<div id="tab6_cli" class="col s12">' +
					'<div class="right input-field botonesFormEdit">' +
						'<button type="button" id="btn_new_hist" data-id="' + item.id + '" class="btn-floating waves-effect waves-light orange" title="Nuevo comentario">' +
							'<i class="material-icons">add</i>' +
						'</button>&nbsp;' +
						'<button type="button" id="btn_refresh_hist" data-id="' + item.id + '" class="btn-floating waves-effect waves-light blue" title="Actualizar">' +
							'<i class="material-icons">refresh</i>' +
						'</button>' +
					'</div>' +
					'<table id="table_historial" class="highlight"></table>' +
					'<div id="resultados_historial" class="right-align"></div>' +
					'<div id="frm_historial" class="left-align"></div>' +
				'</div>' +
				'<div id="tab7_cli" class="col s12">' + 
						'<div class="input-field">' +
							'<input type="text" id="id_cli" name="id_cli" value="' + item.id + '" disabled>' +
							'<label for="id_cli" class="active">ID Cliente BBDD</label>' +
						'</div>' +    
						'<div class="input-field">' +
							'<input type="text" id="mantenedor_cli" name="mantenedor_cli" value="' + item.id_mantenedor + '" disabled>' +
							'<label for="mantenedor_cli" class="active">ID Mantenedor BBDD</label>' +
						'</div>' +   
				'</div>' +
				  '</form>';
				$("#modal_"+seccion).find(".contentTabs").html(frm_tabs);
				$("#modal_"+seccion).find(".contentForm").html(frm_render);
				$("#modal_"+seccion).find('.tabs').tabs();
				$('select#mantenedor_cli').formSelect();
				$("#modal_"+seccion).modal({
					dismissible: false
				});
				$("#modal_"+seccion).modal("open");
				// cargar datos de facturación del cliente, asignar id al botón recargar y renderizar formulario de nuevos datos
				readDatosFacturacion(item.id);
				// cargar historial de comentarios
				readHistorial(item.id);
				// cargar contratadas de este cliente
				readContratadasClientes(item.id);
			},
			error: function(xhr, status, error) {
				// Mostrar un mensaje de error en el centro de la pantalla
				$('#app-content div#error').html(error);
				$('#app-content div#error').show();
			}
		});				
	}else if(cual=="frm_newcli"){
		// petición para obtener mantenedores y construir formulario vacío
		$.ajax({
			url: 'services/clientes.php',
			type: 'POST',
			data: {},
			success: function(data) {
				mantenedores = JSON.parse(data)["mantenedores"];
				var title = "Nuevo cliente";
				$("#modal_"+seccion).find(".modal_txt_title").text(title);
				$("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
				$("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");
				var frm_tabs = '<ul class="tabs modalEditar">' + 
				'<li class="tab col s3"><a class="active tablink1" href="#tab1_cli" title="Ascensor"><i class="material-icons left">code</i></a></li>' + 
				'<li class="tab col s3"><a class="tablink2" href="#tab2_cli" title="Ubicación"><i class="material-icons left">location_on</i></a></li>' + 
				'<li class="tab col s3"><a class="tablink3" href="#tab3_cli" title="Contratación"><i class="material-icons left">account_box</i></a></li>' + 
				'</ul>';
				var frm_render = '<form id="cliente_frm_nuevo">' +
				'<div id="tab1_cli" class="active col s12">' + 
				'<div class="input-field anchoFrm4">' +
				  '<input type="text" id="rae_cli" name="rae_cli" value="">' +
				  '<label for="rae_cli">RAE</label>' +
				'</div>' +
				'<div class="input-field anchoFrm4">' +
				  '<select id="mantenedor_cli" name="mantenedor_cli">';
				for (let clave in mantenedores){
					frm_render += '<option value="'+ clave +'">'+ mantenedores[clave] +'</option>'; 
				};
				frm_render+='</select>' + 
				  '<label for="mantenedor_cli">Mantenedor</label>' +
				'</div>' +
				'<div class="input-field anchoFrm4">' +
				  '<input type="date" id="vencimiento_cli" name="vencimiento_cli">' +
				  '<label for="vencimiento_cli">Vencimiento</label>' +
				'</div>' +
				'<div class="input-field anchoFrm4">' +
				  '<input type="number" id="cada_cli" name="cada_cli" value="">' +
				  '<label for="cada_cli">Periodicidad (años)</label>' +
				'</div>' +
				'</div>' +

				'<div id="tab2_cli" class="active col s12">' + 
				    '<div class="input-field">' +
				      '<input type="text" id="nombre_cli" name="nombre_cli" value="">' +
				      '<label for="nombre_cli">Titular</label>' +
				    '</div>' +
				    '<div class="input-field">' +
				      '<input type="text" id="direccion_cli" name="direccion_cli" value="">' +
				      '<label for="direccion_cli">Dirección</label>' +
				    '</div>' +
				    '<div class="input-field anchoFrm4">' +
				      '<input type="text" id="cp_cli" name="cp_cli" value="">' +
				      '<label for="cp_cli">Código Postal</label>' +
				    '</div>' +
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="localidad_cli" name="localidad_cli" value="">' +
				      '<label for="localidad_cli">Localidad</label>' +
				    '</div>' +   
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="municipio_cli" name="municipio_cli" value="">' +
				      '<label for="municipio_cli">Municipio</label>' +
				    '</div>' +       
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="provincia_cli" name="provincia_cli" value="">' +
				      '<label for="provincia_cli">Provincia</label>' +
				    '</div>' +    
				'</div>' + 

				'<div id="tab3_cli" class="col s12">' + 
				    '<div class="input-field anchoFrm2">' +
				    '<input type="text" id="quien_contrata_cli" name="quien_contrata_cli" value="">' +
				    '<label for="quien_contrata_cli">Quien Contrata</label>' +
				    '</div>' +
				    '<div class="input-field switch">' +
						'<label for="id_administrador_cli">' +
						'<input type="checkbox" id="id_administrador_cli" name="id_administrador_cli" />' +
						'<span class="lever"></span>Administrador' +
						'</label>' +
				    '</div><br>' +
				    '<div class="input-field anchoFrm4">' +
				      '<input type="text" id="telefono_cli" name="telefono_cli" value="">' +
				      '<label for="telefono_cli">Teléfono</label>' +
				      '</div>' +
				    '<div class="input-field anchoFrm4">' +
				      '<input type="text" id="telefono2_cli" name="telefono2_cli" value="">' +
				      '<label for="telefono2_cli">Teléfono 2</label>' +
				      '</div>' +
				    '<div class="input-field anchoFrm2">' +
				      '<input type="text" id="email_cli" name="email_cli" value="">' +
				      '<label for="email_cli">eMail</label>' +
				      '</div>' +
				    '<div class="input-field">' +
				      '<input type="text" id="observaciones_cli" name="observaciones_cli" value="">' +
				      '<label for="observaciones_cli">Observaciones</label>' +
				    '</div>' +    
				'</div>' +
				'</form>';
				$("#modal_"+seccion).find(".contentTabs").html(frm_tabs);
				$("#modal_"+seccion).find(".contentForm").html(frm_render);
				$("#modal_"+seccion).find('.tabs').tabs();
				$('select#mantenedor_cli').formSelect();
				$("#modal_"+seccion).modal({
					dismissible: false
				});
				$("#modal_"+seccion).modal("open");
				setTimeout(function(){ $('#rae_cli').focus(); }, 200);
			},
			error: function(xhr, status, error) {
				// Mostrar un mensaje de error en el centro de la pantalla
				$('#app-content div#error').html(error);
				$('#app-content div#error').show();
			}
		});
	
	}
} // end openCliente()

// Click en crear nuevo cliente (abrir popup)
jQuery(document).on("click", "#add_cli", function(){
	window.openModal('cli', 'frm_newcli');
});

// Click en exportar clientes (abrir popup)
jQuery(document).on("click", "#exportar_cli", function(){
	jQuery("#export-title").text("Exportar listado de clientes en XLS (Excel)");
  	//const lastView = dataLayer.reverse().find(obj => obj.type === "view_cli");
  	var export_content = '<form>' +
  	'<div class="input-field col s12">' + 
  	'<span>Selecciona los campos que deseas incluir en la exportación:</span>' + 
  	'</div>' + 
  	'<div class="row">' + 
	  	'<div class="col s6">' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="id" checked="checked" /><span>ID BBDD</span></label></p>' +
		  	'</div>' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="rae" checked="checked" /><span>RAE</span></label></p>' +
		  	'</div>' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="nombre" checked="checked" /><span>Titular</span></label></p>' +
		  	'</div>' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="direccion" checked="checked" /><span>Dirección</span></label></p>' + 
		  	'</div>' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="localidad" checked="checked" /><span>Localidad</span></label></p>' + 
		  	'</div>' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="municipio" checked="checked" /><span>Municipio</span></label></p>' + 
		  	'</div>' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="cp" checked="checked" /><span>Código Postal</span></label></p>' + 
		  	'</div>' + 
	  	'</div>' + 
		'<div class="col s6">' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="mantenedor" checked="checked" /><span>Mantenedor</span></label></p>' + 
		  	'</div>' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="vencimiento_dmy" checked="checked" /><span>Vencimiento</span></label></p>' + 
		  	'</div>' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="cada" checked="checked" /><span>Periodicidad (cada)</span></label></p>' + 
		  	'</div>' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="telefono" checked="checked" /><span>Telefono</span></label></p>' + 
		  	'</div>' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="telefono2" checked="checked" /><span>Telefono 2</span></label></p>' + 
		  	'</div>' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="email" checked="checked" /><span>Correo electrónico</span></label></p>' + 
		  	'</div>' + 
		  	'<div class="input-field">' + 
		  	'<p><label><input type="checkbox" class="filled-in" cli_data="observaciones" checked="checked" /><span>Observaciones</span></label></p>' + 
		  	'</div>' + 
		'</div>' +   	
		'<div class="col s12">' + 
		  	'<div class="input-field col s12 center">' + 
		  		'<a href="#!" class="waves-effect waves-light btn green accent-4" id="exportar_xls_cli"><i class="material-icons left">file_download</i>Descargar</a>' + 
		  	'</div>' + 
		'</div>' + 
	'</div>' + 
  	'</form>' + 
  	'</div>';
  	jQuery("#export-content").html(export_content);
  	jQuery("#modal_export").modal({
		dismissible: false
	});
  	jQuery("#modal_export").modal("open");
}); // end click en exportar clientes

// Click en exportar clientes (abrir popup)
jQuery(document).on("click", "#exportar_xls_cli", function(){
	lastObject = dataLayer.reverse().find(obj => obj.type === "list_cli");
	var filteredData = filterData(lastObject.data);
	downloadXLS(filteredData);
});

// función auxiliar para filtrar clientes
function filterData(data) {
	var selectedFields = [];
	jQuery('input[type="checkbox"]:checked').each(function() {
		selectedFields.push(jQuery(this).attr("cli_data"));
	});

	var filteredData = [];
	for (var i = 0; i < data.length; i++) {
		var obj = {};
		for (var j = 0; j < selectedFields.length; j++) {
			obj[selectedFields[j]] = data[i][selectedFields[j]];
		}
		filteredData.push(obj);
	}

	return filteredData;
} // end filterdata()

// función auxiliar para descargar XLS
function downloadXLS(datos) {
  var headers = Object.keys(datos[0]);
  var data = [];
  data.push(headers);

  for (var i = 0; i < datos.length; i++) {
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      row.push(datos[i][headers[j]]);
    }
    data.push(row);
  }

  var ws = XLSX.utils.aoa_to_sheet(data);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, "datos.xlsx");
} // end downloadXLS()

// funcion guardar el cliente
var saveCliente = function() {

	// informamos en el popup del estado
	$('#confirm-message').text("...guardando los cambios...");

	// Obtener los valores de los campos del formulario
  var id = $('#id_cli').val();
  var rae = $('#rae_cli').val();
  var nombre = $('#nombre_cli').val().toUpperCase();
  var direccion = $('#direccion_cli').val().toUpperCase();
  var localidad = $('#localidad_cli').val().toUpperCase();
  var municipio = $('#municipio_cli').val().toUpperCase();
  var cp = $('#cp_cli').val();
  var provincia = $('#provincia_cli').val().toUpperCase();
  var quien_contrata = $('#quien_contrata_cli').val();
  var observaciones = $('#observaciones_cli').val();
  var id_mantenedor = $('#mantenedor_cli').val();
  var id_administrador = $('#id_administrador_cli').is(':checked') ? 1 : 0;
  var vencimiento = $('#vencimiento_cli').val();
  var cada = $('#cada_cli').val();
  var telefono = $('#telefono_cli').val();
  var telefono2 = $('#telefono2_cli').val();
  var email = $('#email_cli').val();

  // Crear un objeto con los valores de los campos del formulario
  var cliente = {
    rae: rae,
    nombre: nombre,
    direccion: direccion,
    localidad: localidad,
    municipio: municipio,
    cp: cp,
    provincia: provincia,
    quien_contrata: quien_contrata,
    observaciones: observaciones,
    id_mantenedor: id_mantenedor,
    vencimiento: vencimiento,
    cada: cada,
		id_administrador : id_administrador,
		telefono : telefono,
		telefono2 : telefono2,
		email : email
  };
  // incluir id solo si tiene valor (para diferenciar update de insert)
  if (typeof id !== 'undefined' && id !== null && String(id).trim() !== '') {
    cliente.id = id;
  }

	$.ajax({
		url: 'services/clientes_save.php',
		type: 'POST',
		data: cliente,
		success: function(data) {

			// Si el servidor devuelve OK, procedemos como siempre
			if (typeof data === 'string' && data.trim() === 'OK') {
			  // Cerrar el modal de confirmación
			  $('#modal_confirm').modal('close');
			  // Cerrar el modal de clientes
			  $('#modal_cli').modal('close'); 
			  // actualizar el listado
			  $("#filtrar_cli").click();
			  return;
			}

			// Si llegamos aquí, el servidor devolvió un mensaje de error (texto)
			var serverMsg = (typeof data === 'string') ? data : JSON.stringify(data);
			modalError('ERROR', 'Error al guardar cliente: ' + serverMsg, false, 'Cerrar', 'error', function(){
				// El modal de error ya se cierra en su handler; aquí cerramos el modal de cliente
				$('#modal_cli').modal('close');
			});
		},
		error: function(xhr, status, error) {
			// Construir mensaje informativo con código y cuerpo de respuesta si existe
			var msg = '';
			if(xhr && xhr.responseText){
				msg = xhr.status + ' ' + (xhr.statusText || '') + ': ' + xhr.responseText;
			}else{
				msg = status + ' - ' + error;
			}
			modalError('ERROR', 'Error en la petición al guardar cliente. ' + msg, false, 'Cerrar', 'error', function(){
				// Cerrar el modal de cliente al aceptar el error
				$('#modal_cli').modal('close');
			});
		}
	});
} // end saveCliente()


// Click en guardar cliente
$(document.body).on("click", "#cli_save", function(){
	modalConfirm("Guardar cambios en cliente", "¿Estás seguro de que quieres guardar los cambios?\n\n", false, "Guardar", "Cancelar", "save", "clear", function(){
		saveCliente(); // acción de guardar
	}, function(){ 
		console.log('Accion cancelar: no se han guardado los cambios');
	});
}); // end click en guardar cliente