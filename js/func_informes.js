// Funciones relacionadas con la pestaña de informes
var equiposCatalogMap = {};
var equiposCatalogById = {};
var inspectorEquiposDefaultIds = [];
var firmaPadState = {
	canvas: null,
	ctx: null,
	isDrawing: false,
	hasStrokes: false,
	currentInformeId: null
};
var FIRMA_EXPORT_WIDTH = 800;
var FIRMA_EXPORT_HEIGHT = 600;

function escapeHtml(text){
	return String(text == null ? '' : text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function parseDateToInput(dateText){
	if(!dateText) return '';
	var text = String(dateText).trim();
	if(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(text)) return text;
	if(/^[0-9]{2}-[0-9]{2}-[0-9]{4}$/.test(text)){
		var parts = text.split('-');
		return parts[2] + '-' + parts[1] + '-' + parts[0];
	}
	return text;
}

function parseDateToStorage(dateText){
	if(!dateText) return '';
	var text = String(dateText).trim();
	if(/^[0-9]{2}-[0-9]{2}-[0-9]{4}$/.test(text)) return text;
	if(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(text)){
		var parts = text.split('-');
		return parts[2] + '-' + parts[1] + '-' + parts[0];
	}
	return text;
}

function stripEquipoCaducidad(nombre){
	if(!nombre) return '';
	return String(nombre).replace(/\s*=>{4}\s*Caducidad:\s*[0-9]{2}-[0-9]{2}-[0-9]{4}\s*$/i, '').trim();
}

function buildEquipoLabel(equipo){
	if(!equipo) return '';
	var codigo = (equipo.codigo || '').trim();
	var nombre = (equipo.nombre || '').trim();
	var marca = (equipo.marca || '').trim();
	var modelo = (equipo.modelo || '').trim();
	var numSerie = (equipo.num_serie || '').trim();
	var parts = [];
	if(codigo) parts.push(codigo);
	if(nombre) parts.push(nombre);
	if(marca || modelo || numSerie){
		parts.push([marca, modelo].filter(Boolean).join(' - ') + (numSerie ? ' (' + numSerie + ')' : ''));
	}
	return parts.filter(Boolean).join(' - ');
}

function normalizeInspectorEquiposIds(rawEquipos){
	var ids = [];
	if(rawEquipos == null) return ids;

	var value = rawEquipos;
	if(typeof value === 'string'){
		var text = value.trim();
		if(text === '' || text.toLowerCase() === 'null') return ids;
		try {
			value = JSON.parse(text);
		} catch(err){
			return ids;
		}
	}

	if(Array.isArray(value)){
		$.each(value, function(_, item){
			if(item && typeof item === 'object' && item.id !== undefined){
				var parsedObj = parseInt(item.id, 10);
				if(!isNaN(parsedObj) && parsedObj > 0) ids.push(parsedObj);
				return;
			}
			var parsed = parseInt(item, 10);
			if(!isNaN(parsed) && parsed > 0) ids.push(parsed);
		});
	} else if(value && typeof value === 'object'){
		if(Array.isArray(value.ids)){
			$.each(value.ids, function(_, item){
				var parsed = parseInt(item, 10);
				if(!isNaN(parsed) && parsed > 0) ids.push(parsed);
			});
		} else {
			$.each(Object.keys(value), function(_, key){
				var parsedKey = parseInt(key, 10);
				if(!isNaN(parsedKey) && parsedKey > 0){
					ids.push(parsedKey);
					return;
				}
				var maybe = value[key];
				var parsedVal = parseInt(maybe, 10);
				if(!isNaN(parsedVal) && parsedVal > 0) ids.push(parsedVal);
			});
		}
	}

	return Array.from(new Set(ids));
}

function loadInspectorEquiposDefaults(userId, callback){
	if(!userId){
		inspectorEquiposDefaultIds = [];
		if(typeof callback === 'function') callback(inspectorEquiposDefaultIds);
		return;
	}

	$.ajax({
		url: 'services/usuarios.php',
		type: 'POST',
		data: { action: 'list', filtro_id: userId },
		success: function(data){
			var parsed = null;
			try {
				parsed = (typeof data === 'string') ? JSON.parse(data) : data;
			} catch(err){
				parsed = null;
			}
			var usuario = (parsed && parsed.resultados && parsed.resultados.length) ? parsed.resultados[0] : null;
			inspectorEquiposDefaultIds = normalizeInspectorEquiposIds(usuario ? usuario.equipos : null);
			if(typeof callback === 'function') callback(inspectorEquiposDefaultIds);
		},
		error: function(){
			inspectorEquiposDefaultIds = [];
			if(typeof callback === 'function') callback(inspectorEquiposDefaultIds);
		}
	});
}

function addInspectorEquiposToForm(){
	if(!inspectorEquiposDefaultIds || !inspectorEquiposDefaultIds.length){
		M.toast({ html: 'El inspector no tiene equipos predefinidos' });
		return;
	}

	var addFromCatalog = function(){
		var existingNames = {};
		$('#equipos_tbody .equipo-utilizado-row .equipo_nombre').each(function(){
			var current = stripEquipoCaducidad(($(this).val() || '').trim());
			if(current) existingNames[current] = true;
		});

		var added = 0;
		var missing = [];
		$.each(inspectorEquiposDefaultIds, function(_, eqId){
			var info = equiposCatalogById[String(eqId)];
			if(!info){
				missing.push(eqId);
				return;
			}
			if(existingNames[info.label]) return;
			addEquipoUtilizadoRow(info.label, info.proxima);
			existingNames[info.label] = true;
			added++;
		});

		if(added > 0){
			M.toast({ html: 'Se añadieron ' + added + ' equipos del inspector' });
		}
		if(missing.length > 0){
			M.toast({ html: 'IDs no encontrados en catálogo: ' + missing.join(', ') });
		}
		if(added === 0 && missing.length === 0){
			M.toast({ html: 'No hay equipos nuevos para añadir' });
		}
	};

	if(Object.keys(equiposCatalogById).length === 0){
		loadEquiposCatalog(function(){ addFromCatalog(); });
		return;
	}
	addFromCatalog();
}

function renderEquiposCatalogList(){
	var html = '';
	$.each(equiposCatalogMap, function(label, prox){
		html += '<option value="' + escapeHtml(label) + '"></option>';
	});
	$('#equipos_catalogo_list').html(html);
}

function syncEquiposRowsFromCatalog(){
	$('#equipos_tbody .equipo-utilizado-row').each(function(){
		var $row = $(this);
		var label = ($row.find('.equipo_nombre').val() || '').trim();
		var prox = equiposCatalogMap[label] || '';
		var $fecha = $row.find('.equipo_proxima_calibracion');
		if(prox && $fecha.length && (!$fecha.val() || $fecha.val().trim() === '')){
			$fecha.val(parseDateToInput(prox));
		}
	});
}

function loadEquiposCatalog(callback){
	$.ajax({
		url: 'services/equipos.php',
		type: 'POST',
		data: { filtro_total: 500 },
		success: function(data){
			var parsed = null;
			try{
				parsed = (typeof data === 'string') ? JSON.parse(data) : data;
			}catch(err){
				parsed = null;
			}
			equiposCatalogMap = {};
			equiposCatalogById = {};
			$.each((parsed && parsed.resultados) ? parsed.resultados : [], function(index, equipo){
				var label = buildEquipoLabel(equipo);
				var id = parseInt(equipo.id, 10);
				var prox = (equipo.prox_calibracion_dmy && equipo.prox_calibracion_dmy !== '-') ? equipo.prox_calibracion_dmy : '';
				if(label){
					equiposCatalogMap[label] = prox;
					if(!isNaN(id) && id > 0){
						equiposCatalogById[String(id)] = {
							label: label,
							proxima: prox
						};
					}
				}
			});
			renderEquiposCatalogList();
			syncEquiposRowsFromCatalog();
			if(typeof callback === 'function') callback();
		},
		error: function(){
			equiposCatalogMap = {};
			equiposCatalogById = {};
			renderEquiposCatalogList();
			if(typeof callback === 'function') callback();
		}
	});
}

function buildEquiposTab7(equiposData){
	var html = '';
	html += '<div class="row" style="margin-bottom:8px;">' +
		'<div class="col s12 right-align">' +
			'<a href="#" id="add_equipo_utilizado" class="btn waves-effect waves-light green btn-small"><i class="material-icons left">add</i>Agregar equipo utilizado</a>&nbsp;' +
			'<a href="#" id="add_equipos_inspector" class="btn waves-effect waves-light teal btn-small"><i class="material-icons left">assignment_ind</i>Agregar equipos del inspector</a>&nbsp;' +
			'<a href="#" id="refresh_equipos_catalog" class="btn waves-effect waves-light blue btn-small"><i class="material-icons left">refresh</i>Refrescar equipos</a>' +
		'</div>' +
	'</div>';
	html += '<datalist id="equipos_catalogo_list"></datalist>';
	html += '<table class="mediciones-table" id="equipos-table">' +
		'<thead><tr>' +
			'<th>Equipo</th><th>Próxima calibración</th><th>Acción</th>' +
		'</tr></thead>' +
		'<tbody id="equipos_tbody">';
	$.each(equiposData || {}, function(key, data){
		var nombre = stripEquipoCaducidad((data && data.nombre) ? data.nombre : '');
		var proxima = (data && data.proxima_calibracion) ? data.proxima_calibracion : '';
		html += '<tr class="equipo-utilizado-row" data-equipo-key="' + escapeHtml(key) + '">' +
			'<td class="equipo-nombre-cell"><input type="text" class="equipo_nombre" list="equipos_catalogo_list" value="' + escapeHtml(nombre) + '" placeholder="Equipo utilizado"></td>' +
			'<td class="equipo-fecha-cell"><input type="date" class="equipo_proxima_calibracion" value="' + escapeHtml(parseDateToInput(proxima)) + '"></td>' +
			'<td class="equipo-accion-cell"><a href="#" class="btn-floating btn-small waves-effect waves-light red remove-equipo-utilizado" title="Eliminar"><i class="material-icons">close</i></a></td>' +
		'</tr>';
	});
	html += '</tbody></table>';
	return html;
}

function addEquipoUtilizadoRow(nombre, proximaCalibracion){
	var html = '<tr class="equipo-utilizado-row">' +
		'<td class="equipo-nombre-cell"><input type="text" class="equipo_nombre" list="equipos_catalogo_list" value="' + escapeHtml(nombre || '') + '" placeholder="Equipo utilizado"></td>' +
		'<td class="equipo-fecha-cell"><input type="date" class="equipo_proxima_calibracion" value="' + escapeHtml(parseDateToInput(proximaCalibracion || '')) + '"></td>' +
		'<td class="equipo-accion-cell"><a href="#" class="btn-floating btn-small waves-effect waves-light red remove-equipo-utilizado" title="Eliminar"><i class="material-icons">close</i></a></td>' +
	'</tr>';
	$('#equipos_tbody').append(html);
}

function serializeEquiposFromForm(){
	var equipos = {};
	var index = 1;
	$('#equipos_tbody .equipo-utilizado-row').each(function(){
		var nombre = stripEquipoCaducidad(($(this).find('.equipo_nombre').val() || '').trim());
		var proxima = ($(this).find('.equipo_proxima_calibracion').val() || '').trim();
		if(nombre !== '' || proxima !== ''){
			equipos[String(index)] = {
				nombre: nombre,
				proxima_calibracion: parseDateToStorage(proxima)
			};
			index++;
		}
	});
	return equipos;
}

function buildFirmaTab9(idInforme){
	var idSafe = (idInforme || '').toString();
	var html = '';
	html += '<div class="firma-pri-wrap" data-informe-id="' + escapeHtml(idSafe) + '">';
	html += '<div id="firma_pri_header" class="firma-pri-header">Firma del informe (ratón o dedo)</div>';
	html += '<div class="firma-pri-pad">';
	html += '<canvas id="firma_pri_canvas"></canvas>';
	html += '</div>';
	html += '<div id="firma_pri_actions" class="firma-pri-actions right-align">';
	html += '<a href="#" id="firma_pri_clear" class="btn waves-effect waves-light grey"><i class="material-icons left">clear</i>Borrar</a>&nbsp;';
	html += '<a href="#" id="firma_pri_delete" class="btn waves-effect waves-light red" style="display:none;"><i class="material-icons left">delete</i>Eliminar firma</a>&nbsp;';
	html += '<a href="#" id="firma_pri_save" class="btn waves-effect waves-light green"><i class="material-icons left">save</i>Guardar firma</a>';
	html += '</div>';
	html += '<div id="firma_pri_preview_wrap" class="firma-pri-preview-wrap" style="display:none;">';
	html += '<div class="firma-pri-preview-title">Firma guardada</div>';
	html += '<img id="firma_pri_preview" class="firma-pri-preview" alt="Firma guardada">';
	html += '</div>';
	html += '</div>';
	return html;
}

function resizeInformeFirmaCanvas(){
	if(!firmaPadState.canvas || !firmaPadState.ctx) return;
	var canvas = firmaPadState.canvas;
	var ratio = Math.max(window.devicePixelRatio || 1, 1);
	var prevImage = null;
	if(firmaPadState.hasStrokes){
		try { prevImage = canvas.toDataURL('image/png'); } catch(err) { prevImage = null; }
	}

	canvas.width = Math.max(1, Math.floor(canvas.offsetWidth * ratio));
	canvas.height = Math.max(1, Math.floor(canvas.offsetHeight * ratio));
	var ctx = canvas.getContext('2d');
	ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
	ctx.lineWidth = 2;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.strokeStyle = '#1565c0';
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
	firmaPadState.ctx = ctx;

	if(prevImage){
		var img = new Image();
		img.onload = function(){
			ctx.drawImage(img, 0, 0, canvas.width / ratio, canvas.height / ratio);
		};
		img.src = prevImage;
	}
}

function ensureInformeFirmaCanvasReady(){
	if(!firmaPadState.canvas) return;
	var canvas = firmaPadState.canvas;
	var ratio = Math.max(window.devicePixelRatio || 1, 1);
	var targetW = Math.max(1, Math.floor(canvas.offsetWidth * ratio));
	var targetH = Math.max(1, Math.floor(canvas.offsetHeight * ratio));
	if(canvas.width !== targetW || canvas.height !== targetH){
		resizeInformeFirmaCanvas();
	}
}

function getFirmaCanvasPoint(evt){
	var canvas = firmaPadState.canvas;
	if(!canvas) return null;
	var rect = canvas.getBoundingClientRect();
	var clientX = evt.clientX;
	var clientY = evt.clientY;
	if((clientX === undefined || clientY === undefined) && evt.touches && evt.touches.length){
		clientX = evt.touches[0].clientX;
		clientY = evt.touches[0].clientY;
	}
	if(clientX === undefined || clientY === undefined) return null;
	return {
		x: (clientX - rect.left),
		y: (clientY - rect.top)
	};
}

function initInformeFirmaPad(idInforme){
	var canvas = document.getElementById('firma_pri_canvas');
	if(!canvas) return;
	canvas.style.touchAction = 'none';

	firmaPadState.canvas = canvas;
	firmaPadState.ctx = canvas.getContext('2d');
	firmaPadState.isDrawing = false;
	firmaPadState.hasStrokes = false;
	firmaPadState.currentInformeId = idInforme;

	resizeInformeFirmaCanvas();

	var onDown = function(evt){
		if(evt && evt.cancelable) evt.preventDefault();
		ensureInformeFirmaCanvasReady();
		var p = getFirmaCanvasPoint(evt);
		if(!p) return;
		firmaPadState.isDrawing = true;
		firmaPadState.ctx.beginPath();
		firmaPadState.ctx.moveTo(p.x, p.y);
		if(window.PointerEvent && evt && evt.pointerId !== undefined && canvas.setPointerCapture){
			try { canvas.setPointerCapture(evt.pointerId); } catch(err) {}
		}
	};

	var onMove = function(evt){
		if(!firmaPadState.isDrawing) return;
		if(evt && evt.cancelable) evt.preventDefault();
		var p = getFirmaCanvasPoint(evt);
		if(!p) return;
		firmaPadState.ctx.lineTo(p.x, p.y);
		firmaPadState.ctx.stroke();
		firmaPadState.hasStrokes = true;
	};

	var onUp = function(evt){
		if(evt && evt.cancelable) evt.preventDefault();
		if(!firmaPadState.isDrawing) return;
		firmaPadState.isDrawing = false;
		firmaPadState.ctx.closePath();
		if(window.PointerEvent && evt && evt.pointerId !== undefined && canvas.releasePointerCapture){
			try { canvas.releasePointerCapture(evt.pointerId); } catch(err) {}
		}
	};

	canvas.onpointerdown = null;
	canvas.onpointermove = null;
	canvas.onpointerup = null;
	canvas.onpointerleave = null;
	canvas.onpointercancel = null;
	canvas.ontouchstart = null;
	canvas.ontouchmove = null;
	canvas.ontouchend = null;
	canvas.onmousedown = null;
	canvas.onmousemove = null;
	canvas.onmouseup = null;
	canvas.onmouseleave = null;

	if (window.PointerEvent) {
		canvas.onpointerdown = onDown;
		canvas.onpointermove = onMove;
		canvas.onpointerup = onUp;
		canvas.onpointerleave = onUp;
		canvas.onpointercancel = onUp;
	} else {
		canvas.ontouchstart = onDown;
		canvas.ontouchmove = onMove;
		canvas.ontouchend = onUp;
		canvas.onmousedown = onDown;
		canvas.onmousemove = onMove;
		canvas.onmouseup = onUp;
		canvas.onmouseleave = onUp;
	}

	loadInformeFirma(idInforme);
}

function clearInformeFirmaPad(){
	if(!firmaPadState.canvas || !firmaPadState.ctx) return;
	firmaPadState.hasStrokes = false;
	var ratio = Math.max(window.devicePixelRatio || 1, 1);
	firmaPadState.ctx.fillStyle = '#ffffff';
	firmaPadState.ctx.fillRect(0, 0, firmaPadState.canvas.width / ratio, firmaPadState.canvas.height / ratio);
}

function setInformeFirmaLocked(locked){
	var $wrap = $('.firma-pri-wrap');
	var $actions = $('#firma_pri_actions');
	var $pad = $wrap.find('.firma-pri-pad');
	var $preview = $('#firma_pri_preview_wrap');

	if(locked){
		$('#firma_pri_header').hide();
		$pad.hide();
		$('#firma_pri_clear').hide();
		$('#firma_pri_save').hide();
		$('#firma_pri_delete').show();
		$preview.after($actions);
	} else {
		$('#firma_pri_header').show();
		$pad.show();
		$('#firma_pri_clear').show();
		$('#firma_pri_save').show();
		$('#firma_pri_delete').hide();
		$pad.after($actions);
	}
}

function setInformeFirmaPreview(url){
	if(url){
		$('#firma_pri_preview').attr('src', url);
		$('#firma_pri_preview_wrap').show();
	}else{
		$('#firma_pri_preview').attr('src', '');
		$('#firma_pri_preview_wrap').hide();
	}
}

function drawImageContain(ctx, img, targetW, targetH){
	if(!ctx || !img || !targetW || !targetH) return;
	var scale = Math.min(targetW / img.width, targetH / img.height);
	var drawW = img.width * scale;
	var drawH = img.height * scale;
	var offsetX = (targetW - drawW) / 2;
	var offsetY = (targetH - drawH) / 2;
	ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
}

function buildNormalizedFirmaDataUrl(){
	if(!firmaPadState.canvas) return null;
	var outCanvas = document.createElement('canvas');
	outCanvas.width = FIRMA_EXPORT_WIDTH;
	outCanvas.height = FIRMA_EXPORT_HEIGHT;
	var outCtx = outCanvas.getContext('2d');
	outCtx.fillStyle = '#ffffff';
	outCtx.fillRect(0, 0, FIRMA_EXPORT_WIDTH, FIRMA_EXPORT_HEIGHT);
	drawImageContain(outCtx, firmaPadState.canvas, FIRMA_EXPORT_WIDTH, FIRMA_EXPORT_HEIGHT);
	return outCanvas.toDataURL('image/png');
}

function drawInformeFirmaFromUrl(url){
	if(!url || !firmaPadState.canvas || !firmaPadState.ctx) return;
	var ratio = Math.max(window.devicePixelRatio || 1, 1);
	var img = new Image();
	img.onload = function(){
		var targetW = firmaPadState.canvas.width / ratio;
		var targetH = firmaPadState.canvas.height / ratio;
		firmaPadState.ctx.fillStyle = '#ffffff';
		firmaPadState.ctx.fillRect(0, 0, targetW, targetH);
		drawImageContain(firmaPadState.ctx, img, targetW, targetH);
		firmaPadState.hasStrokes = true;
	};
	img.src = url;
}

function loadInformeFirma(idInforme){
	if(!idInforme) return;
	$.ajax({
		url: 'services/informes_firma.php',
		type: 'POST',
		dataType: 'json',
		data: { action: 'get', id_informe: idInforme },
		success: function(resp){
			var imgSrc = (resp && resp.data_url) ? resp.data_url : ((resp && resp.url) ? resp.url : null);
			if(resp && resp.success && imgSrc){
				setInformeFirmaPreview(imgSrc);
				drawInformeFirmaFromUrl(imgSrc);
				setInformeFirmaLocked(true);
			} else {
				setInformeFirmaPreview(null);
				setInformeFirmaLocked(false);
			}
		}
	});
}

function saveInformeFirma(){
	var idInforme = firmaPadState.currentInformeId || $('#id_bbdd').val();
	if(!idInforme){
		modalError('ERROR', 'No se encontró el ID del informe.', false, 'Cerrar', 'error');
		return;
	}
	if(!firmaPadState.hasStrokes){
		modalError('ERROR', 'No se puede guardar una firma vacía.', false, 'Cerrar', 'error');
		return;
	}

	var imgData = '';
	try {
		imgData = buildNormalizedFirmaDataUrl();
	} catch(err){
		modalError('ERROR', 'No se pudo generar la imagen de la firma.', false, 'Cerrar', 'error');
		return;
	}

	$.ajax({
		url: 'services/informes_firma.php',
		type: 'POST',
		dataType: 'json',
		data: {
			action: 'save',
			id_informe: idInforme,
			img: imgData
		},
		success: function(resp){
			if(resp && resp.success){
				setInformeFirmaPreview(resp.data_url || resp.url || null);
				setInformeFirmaLocked(true);
				M.toast({ html: 'Firma guardada correctamente' });
			} else {
				modalError('ERROR', (resp && resp.error) ? resp.error : 'No se pudo guardar la firma.', false, 'Cerrar', 'error');
			}
		},
		error: function(){
			modalError('ERROR', 'Error guardando la firma.', false, 'Cerrar', 'error');
		}
	});
}

function deleteInformeFirma(){
	var idInforme = firmaPadState.currentInformeId || $('#id_bbdd').val();
	if(!idInforme){
		modalError('ERROR', 'No se encontró el ID del informe.', false, 'Cerrar', 'error');
		return;
	}

	$.ajax({
		url: 'services/informes_firma.php',
		type: 'POST',
		dataType: 'json',
		data: {
			action: 'delete',
			id_informe: idInforme
		},
		success: function(resp){
			if(resp && resp.success){
				clearInformeFirmaPad();
				setInformeFirmaPreview(null);
				setInformeFirmaLocked(false);
				M.toast({ html: 'Firma eliminada correctamente' });
			} else {
				modalError('ERROR', (resp && resp.error) ? resp.error : 'No se pudo eliminar la firma.', false, 'Cerrar', 'error');
			}
		},
		error: function(){
			modalError('ERROR', 'Error eliminando la firma.', false, 'Cerrar', 'error');
		}
	});
}

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

function buildGrupoOptions(grupos, selectedGrupo){
	var selectedRaw = String(selectedGrupo === undefined || selectedGrupo === null ? '' : selectedGrupo).trim();
	var selectedNorm = normalizeCampoKey(selectedRaw);
	var hasSelected = false;
	var html = '<option value="" disabled' + (selectedRaw === '' ? ' selected' : '') + '>Selecciona grupo</option>';

	$.each(grupos || [], function(index, item){
		var id = String(item.id === undefined || item.id === null ? '' : item.id).trim();
		var nombre = item.nombre || '';
		var legislacion = item.legislacion || '';
		var tipoAscensor = item.tipo_ascensor || '';
		var value = id !== '' ? id : nombre;
		var isSelected = false;

		if(selectedRaw !== ''){
			if(value === selectedRaw){
				isSelected = true;
			} else if(nombre === selectedRaw){
				isSelected = true;
			} else if(selectedNorm !== '' && normalizeCampoKey(nombre) === selectedNorm){
				isSelected = true;
			}
		}

		if(isSelected){
			hasSelected = true;
		}

		html += '<option value="' + value + '" data-legislacion="' + legislacion + '" data-tipo_ascensor="' + tipoAscensor + '"' + (isSelected ? ' selected' : '') + '>' + nombre + '</option>';
	});

	if(selectedRaw !== '' && !hasSelected){
		html = html.replace('<option value="" disabled>Selecciona grupo</option>', '<option value="" disabled selected>Selecciona grupo</option>');
	}

	return html;
}

function syncGrupoLegislacion(){
	var $grupo = $('#grupo_pri');
	if(!$grupo.length) return;
	var legislacion = $grupo.find('option:selected').data('legislacion') || '';
	var tipoAscensor = $grupo.find('option:selected').data('tipo_ascensor') || '';
	$('#legislacion_pri').val(legislacion);
	$('#tipo_ascensor_pri').val(tipoAscensor);
	var $label = $('label[for="legislacion_pri"]');
	if(legislacion){
		$label.addClass('active');
	}else{
		$label.removeClass('active');
	}
	var $labelTipo = $('label[for="tipo_ascensor_pri"]');
	if(tipoAscensor){
		$labelTipo.addClass('active');
	}else{
		$labelTipo.removeClass('active');
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

function syncDuracionMinutos(){
	var horaIni = ($('#hora_ini').val() || '').trim();
	var horaFin = ($('#hora_fin').val() || '').trim();
	var $duracion = $('#duracion_minutos');
	if(!$duracion.length) return;

	if(horaIni === '' || horaFin === ''){
		$duracion.val('');
		return;
	}

	var iniParts = horaIni.split(':');
	var finParts = horaFin.split(':');
	if(iniParts.length < 2 || finParts.length < 2){
		$duracion.val('');
		return;
	}

	var iniMin = parseInt(iniParts[0], 10) * 60 + parseInt(iniParts[1], 10);
	var finMin = parseInt(finParts[0], 10) * 60 + parseInt(finParts[1], 10);
	if(isNaN(iniMin) || isNaN(finMin)){
		$duracion.val('');
		return;
	}

	if(finMin < iniMin){
		finMin += 24 * 60;
	}

	$duracion.val(String(finMin - iniMin));
}

jQuery(document).on('change', '#grupo_pri', function(){
	syncGrupoLegislacion();
});

jQuery(document).on('input', '#gps_latitud, #gps_longitud', function(){
	syncGoogleMapsButton();
});

jQuery(document).on('input change', '#hora_ini, #hora_fin', function(){
	syncDuracionMinutos();
});

function safeInputValue(value){
	return (value === undefined || value === null) ? '' : value;
}

function normalizeCampoKey(value){
	var txt = String(value === undefined || value === null ? '' : value).toLowerCase().trim();
	if(typeof txt.normalize === 'function'){
		txt = txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	}
	txt = txt.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
	return txt;
}

function resolveCampoData(dataMap, abrev, nombre){
	if(!dataMap || typeof dataMap !== 'object') return null;

	var exactKeys = [];
	if(abrev) exactKeys.push(abrev);
	if(nombre) exactKeys.push(nombre);
	for(var i = 0; i < exactKeys.length; i++){
		if(dataMap[exactKeys[i]] !== undefined) return dataMap[exactKeys[i]];
	}

	var candidateKeys = {};
	if(abrev) candidateKeys[normalizeCampoKey(abrev)] = true;
	if(nombre) candidateKeys[normalizeCampoKey(nombre)] = true;

	if(Array.isArray(dataMap)){
		for(var idx = 0; idx < dataMap.length; idx++){
			var arrItem = dataMap[idx];
			if(!arrItem || typeof arrItem !== 'object') continue;
			var arrKey = arrItem.abrev || arrItem.clave || arrItem.key || arrItem.name || arrItem.nombre || '';
			if(candidateKeys[normalizeCampoKey(arrKey)]) return arrItem;
		}
		return null;
	}

	for(var k in dataMap){
		if(!Object.prototype.hasOwnProperty.call(dataMap, k)) continue;
		if(candidateKeys[normalizeCampoKey(k)]) return dataMap[k];
	}

	for(var key in dataMap){
		if(!Object.prototype.hasOwnProperty.call(dataMap, key)) continue;
		var item = dataMap[key];
		if(!item || typeof item !== 'object') continue;
		var itemKey = item.abrev || item.clave || item.key || item.name || item.nombre || '';
		if(candidateKeys[normalizeCampoKey(itemKey)]) return item;
	}

	return null;
}

function resolveCampoValor(fieldData){
	if(fieldData === undefined || fieldData === null) return '';
	if(typeof fieldData !== 'object') return fieldData;
	if(fieldData.valor !== undefined && fieldData.valor !== null) return fieldData.valor;
	if(fieldData.value !== undefined && fieldData.value !== null) return fieldData.value;
	return '';
}

function resolveCampoUnidad(fieldData, defaultUnidad){
	var unidad = defaultUnidad || '';
	if(fieldData && typeof fieldData === 'object'){
		if(fieldData.unidad !== undefined && fieldData.unidad !== null && fieldData.unidad !== ''){
			unidad = fieldData.unidad;
		} else if(fieldData.unit !== undefined && fieldData.unit !== null && fieldData.unit !== ''){
			unidad = fieldData.unit;
		}
	}
	return unidad;
}

function buildCamposInputHtml(dataType, nombreCampo, valor, listaValores){
	var html = '';
	if(dataType === 'NUMERO'){
		html += '<input type="number" class="campo_valor" data-campo-nombre="' + nombreCampo + '" value="' + safeInputValue(valor) + '">';
	} else if(dataType === 'TEXTO NORMAL'){
		html += '<input type="text" class="campo_valor" data-campo-nombre="' + nombreCampo + '" value="' + safeInputValue(valor) + '">';
	} else if(dataType === 'LISTA VALORES'){
		html += '<select class="campo_valor" data-campo-nombre="' + nombreCampo + '">';
		html += '<option value="" ' + ((valor === '' || valor === null || valor === undefined) ? 'selected' : '') + '>---</option>';
		$.each(listaValores, function(i, itemLista){
			html += '<option value="' + itemLista + '" ' + ((String(valor) === String(itemLista)) ? 'selected' : '') + '>' + itemLista + '</option>';
		});
		html += '</select>';
	} else if(dataType === 'CHECKBOX'){
		html += '<label><input type="checkbox" class="campo_valor" data-campo-nombre="' + nombreCampo + '" ' + (valor ? 'checked' : '') + '><span></span></label>';
	} else if(dataType === 'FECHA'){
		html += '<input type="date" class="campo_valor" data-campo-nombre="' + nombreCampo + '" value="' + safeInputValue(valor) + '">';
	} else {
		html += '<input type="text" class="campo_valor" data-campo-nombre="' + nombreCampo + '" value="' + safeInputValue(valor) + '">';
	}
	return html;
}

function buildInstalacionTab2(camposData, instalacionData){
	var html = '';
	var instalacion = {};
	try {
		instalacion = (instalacionData && typeof instalacionData === 'object') ? instalacionData : {};
	} catch(err) { instalacion = {}; }

	html += '<table class="mediciones-table">' +
		'<thead><tr>' +
			'<th>Campo</th><th>Valor</th><th>Unidades</th><th>Descripción</th>' +
		'</tr></thead>' +
		'<tbody id="instalacion_tbody">';

	$.each(camposData || [], function(idx, campo){
		if(campo.tipo !== 'INSTALACIÓN') return;
		var nombreCampo = campo.nombre || '';
		var abrevCampo = campo.abrev || nombreCampo;
		var dataType = campo.data_type || 'TEXTO NORMAL';
		var descripcion = campo.descripcion || '';
		var campoData = resolveCampoData(instalacion, abrevCampo, nombreCampo);
		var valor = resolveCampoValor(campoData);
		var unidad = resolveCampoUnidad(campoData, campo.unidad || '');
		var listaValores = (campo.lista || '').split(',').map(function(v){ return v.trim(); }).filter(function(v){ return v !== ''; });

		html += '<tr class="instalacion-row" data-campo-abrev="' + abrevCampo + '" data-campo-nombre="' + nombreCampo + '" data-campo-tipo="' + dataType + '">';
		html += '<td class="medicion-nombre-cell">' + nombreCampo + '</td>';
		html += '<td class="medicion-valor-cell">' + buildCamposInputHtml(dataType, nombreCampo, valor, listaValores) + '</td>';
		html += '<td class="medicion-unidad-cell">';
		if(dataType !== 'CHECKBOX' && dataType !== 'TEXTO NORMAL'){
			html += '<input type="text" class="campo_unidad" data-campo-abrev="' + abrevCampo + '" data-default-unidad="' + (campo.unidad || '') + '" value="' + (unidad || campo.unidad || '') + '" placeholder="Unidad">';
		}
		html += '</td>';
		html += '<td class="medicion-desc-cell">' + (descripcion || '') + '</td>';
		html += '</tr>';
	});

	html += '</tbody></table>';
	return html;
}

function buildAscensorTab3(camposData, ascensorData){
	var html = '';
	var ascensor = {};
	try {
		ascensor = (ascensorData && typeof ascensorData === 'object') ? ascensorData : {};
	} catch(err) { ascensor = {}; }

	html += '<table class="mediciones-table">' +
		'<thead><tr>' +
			'<th>Campo</th><th>Valor</th><th>Unidades</th><th>Descripción</th>' +
		'</tr></thead>' +
		'<tbody id="ascensor_tbody">';

	$.each(camposData || [], function(idx, campo){
		if(campo.tipo !== 'CARACTERÍSTICAS') return;
		var nombreCampo = campo.nombre || '';
		var abrevCampo = campo.abrev || nombreCampo;
		var dataType = campo.data_type || 'TEXTO NORMAL';
		var descripcion = campo.descripcion || '';
		var campoData = resolveCampoData(ascensor, abrevCampo, nombreCampo);
		var valor = resolveCampoValor(campoData);
		var unidad = resolveCampoUnidad(campoData, campo.unidad || '');
		var listaValores = (campo.lista || '').split(',').map(function(v){ return v.trim(); }).filter(function(v){ return v !== ''; });

		html += '<tr class="ascensor-row" data-campo-abrev="' + abrevCampo + '" data-campo-nombre="' + nombreCampo + '" data-campo-tipo="' + dataType + '">';
		html += '<td class="medicion-nombre-cell">' + nombreCampo + '</td>';
		html += '<td class="medicion-valor-cell">' + buildCamposInputHtml(dataType, nombreCampo, valor, listaValores) + '</td>';
		html += '<td class="medicion-unidad-cell">';
		if(dataType !== 'CHECKBOX' && dataType !== 'TEXTO NORMAL'){
			html += '<input type="text" class="campo_unidad" data-campo-abrev="' + abrevCampo + '" data-default-unidad="' + (campo.unidad || '') + '" value="' + (unidad || campo.unidad || '') + '" placeholder="Unidad">';
		}
		html += '</td>';
		html += '<td class="medicion-desc-cell">' + (descripcion || '') + '</td>';
		html += '</tr>';
	});

	html += '</tbody></table>';
	return html;
}

function serializeInstalacionFromForm(){
	var instalacion = {};
	$('#instalacion_container .instalacion-row[data-campo-abrev]').each(function(){
		var abrev = $(this).data('campo-abrev');
		var nombre = $(this).data('campo-nombre');
		var tipo = $(this).data('campo-tipo') || '';
		var $valorInput = $(this).find('.campo_valor');
		var valor = $valorInput.attr('type') === 'checkbox' ? $valorInput.is(':checked') : $valorInput.val();
		var unidad = $(this).find('.campo_unidad').length ? $(this).find('.campo_unidad').val() : '';
		instalacion[abrev] = { name: nombre, valor: valor !== undefined && valor !== null ? valor : '', unidad: unidad || '', tipo: tipo };
	});
	return instalacion;
}

function serializeAscensorFromForm(){
	var ascensor = {};
	$('#ascensor_container .ascensor-row[data-campo-abrev]').each(function(){
		var abrev = $(this).data('campo-abrev');
		var nombre = $(this).data('campo-nombre');
		var tipo = $(this).data('campo-tipo') || '';
		var $valorInput = $(this).find('.campo_valor');
		var valor = $valorInput.attr('type') === 'checkbox' ? $valorInput.is(':checked') : $valorInput.val();
		var unidad = $(this).find('.campo_unidad').length ? $(this).find('.campo_unidad').val() : '';
		ascensor[abrev] = { name: nombre, valor: valor !== undefined && valor !== null ? valor : '', unidad: unidad || '', tipo: tipo };
	});
	return ascensor;
}

function buildMedicionesTab4(camposData, medicionesData){
	var html = '';
	var mediciones = {};
	var totalCamposMedida = 0;
	var baseNames = {};
	try {
		mediciones = (medicionesData && typeof medicionesData === 'object') ? medicionesData : {};
	} catch(err) {
		mediciones = {};
	}

	html += '<div class="row mediciones-toolbar">' +
		'<div class="input-field col s4 m3 l3" style="margin-top:0;">' +
			'<select id="mediciones_mode">' +
				'<option value="normal" selected>Modo normal</option>' +
				'<option value="codigo">Modo codigo JSON</option>' +
			'</select>' +
			'<label class="active" for="mediciones_mode">Modo de edicion</label>' +
		'</div>' +
		'<div class="col s8 m9 l9 right-align" style="padding-top:8px;">' +
			'<a id="copy_mediciones_json" class="btn blue waves-effect waves-light"><i class="material-icons left">content_copy</i>Copiar JSON</a>' +
		'</div>' +
	'</div>';

	html += '<div id="mediciones_mode_normal">';

	html += '<table class="mediciones-table">' +
		'<thead><tr>' +
			'<th>Clave</th><th>Medición</th><th>Valor</th><th>Unidades</th><th>Descripción</th>' +
		'</tr></thead>' +
		'<tbody id="mediciones_tbody">';

	// Campos de base de datos
	$.each(camposData || [], function(idx, campo){
		if(campo.tipo !== 'MEDIDAS') return;

		var nombreCampo = campo.nombre || '';
		var abrevCampo = campo.abrev || nombreCampo;
		baseNames[abrevCampo] = true;
		baseNames[normalizeCampoKey(abrevCampo)] = true;
		baseNames[normalizeCampoKey(nombreCampo)] = true;
		var dataType = campo.data_type || 'NUMERO';
		var descripcion = campo.descripcion || '';
		var medicionData = resolveCampoData(mediciones, abrevCampo, nombreCampo);
		var valor = resolveCampoValor(medicionData);
		var unidad = resolveCampoUnidad(medicionData, campo.unidad || '');
		var listaValores = (campo.lista || '').split(',').map(function(v){ return v.trim(); }).filter(function(v){ return v !== ''; });

		html += '<tr class="medicion-row" data-medicion-abrev="' + abrevCampo + '" data-medicion-nombre="' + nombreCampo + '" data-medicion-tipo="' + dataType + '">';
		html += '<td class="medicion-clave-cell"><span class="medicion-clave-text">' + abrevCampo + '</span></td>';
		html += '<td class="medicion-nombre-cell">' + nombreCampo + '</td>';
		html += '<td class="medicion-valor-cell">';
		if(dataType === 'NUMERO'){
			html += '<input type="number" class="medicion_valor" data-medicion-abrev="' + abrevCampo + '" value="' + safeInputValue(valor) + '">';
		} else if(dataType === 'TEXTO NORMAL'){
			html += '<input type="text" class="medicion_valor" data-medicion-abrev="' + abrevCampo + '" value="' + safeInputValue(valor) + '">';
		} else if(dataType === 'LISTA VALORES'){
			html += '<select class="medicion_valor" data-medicion-abrev="' + abrevCampo + '">';
			html += '<option value="" ' + ((valor === '' || valor === null || valor === undefined) ? 'selected' : '') + '>---</option>';
			$.each(listaValores, function(i, itemLista){
				html += '<option value="' + itemLista + '" ' + ((String(valor) === String(itemLista)) ? 'selected' : '') + '>' + itemLista + '</option>';
			});
			html += '</select>';
		} else if(dataType === 'CHECKBOX'){
			html += '<label><input type="checkbox" class="medicion_valor" data-medicion-abrev="' + abrevCampo + '" ' + (valor ? 'checked' : '') + '><span></span></label>';
		} else if(dataType === 'FECHA'){
			html += '<input type="date" class="medicion_valor" data-medicion-abrev="' + abrevCampo + '" value="' + safeInputValue(valor) + '">';
		} else {
			html += '<input type="text" class="medicion_valor" data-medicion-abrev="' + abrevCampo + '" value="' + safeInputValue(valor) + '">';
		}
		html += '</td>';
		html += '<td class="medicion-unidad-cell">';
		if(dataType !== 'CHECKBOX' && dataType !== 'TEXTO NORMAL'){
			html += '<input type="text" class="medicion_unidad" data-medicion-abrev="' + abrevCampo + '" data-default-unidad="' + (campo.unidad || '') + '" value="' + (unidad || campo.unidad || '') + '" placeholder="Unidad">';
		}
		html += '</td>';
		html += '<td class="medicion-desc-cell">' + (descripcion || '') + '</td>';
		html += '</tr>';
	});

	// Mediciones personalizadas existentes
	$.each(mediciones, function(abrev, data){
		if(baseNames[abrev] || baseNames[normalizeCampoKey(abrev)]) return;
		var nombreDisplay = (data && typeof data === 'object' && data.name) ? data.name : abrev;
		var valorPersonalizado = resolveCampoValor(data);
		var unidadPersonalizada = resolveCampoUnidad(data, '');
		html += '<tr class="medicion_personalizada_row">' +
			'<td class="medicion-clave-cell"><input type="text" class="medicion_personalizada_clave" placeholder="clave_var" value="' + (abrev || '') + '"></td>' +
			'<td class="medicion-nombre-cell"><input type="text" class="medicion_personalizada_nombre" placeholder="Nombre de medida" value="' + (nombreDisplay || '') + '"></td>' +
			'<td class="medicion-valor-cell"><input type="text" class="medicion_personalizada_valor" placeholder="Valor" value="' + safeInputValue(valorPersonalizado) + '"></td>' +
			'<td class="medicion-unidad-cell"><input type="text" class="medicion_personalizada_unidad" placeholder="Unidad" value="' + safeInputValue(unidadPersonalizada) + '"></td>' +
			'<td class="medicion-desc-cell"><a class="btn-floating btn-small waves-effect waves-light red remove-medicion-personalizada"><i class="material-icons">close</i></a></td>' +
		'</tr>';
	});

	html += '</tbody></table>';

	html += '<div style="margin-top:8px;">' +
		'<button type="button" id="add_medicion_personalizada" class="btn waves-effect waves-light green btn-small"><i class="material-icons left">add</i>Agregar medida personalizada</button>' +
		'</div>';

	html += '</div>';

	html += '<div id="mediciones_mode_codigo" style="display:none;">' +
		'<div class="row">' +
			'<div class="input-field col s12" style="margin-top:0;">' +
				'<textarea id="mediciones_json_editor" class="materialize-textarea" spellcheck="false" rows="10" style="height:12.5em;min-height:12.5em;max-height:12.5em;resize:none;overflow:auto;"></textarea>' +
				'<label for="mediciones_json_editor" class="active">JSON de mediciones</label>' +
			'</div>' +
		'</div>' +
	'</div>';

	return html;
}

function addMedicionPersonalizada(clave, nombre, valor, unidad){
	var html = '<tr class="medicion_personalizada_row">' +
		'<td class="medicion-clave-cell"><input type="text" class="medicion_personalizada_clave" placeholder="clave_var" value="' + (clave || '') + '"></td>' +
		'<td class="medicion-nombre-cell"><input type="text" class="medicion_personalizada_nombre" placeholder="Nombre de medida" value="' + (nombre || '') + '"></td>' +
		'<td class="medicion-valor-cell"><input type="text" class="medicion_personalizada_valor" placeholder="Valor" value="' + ((valor !== undefined && valor !== null && valor !== '') ? valor : '') + '"></td>' +
		'<td class="medicion-unidad-cell"><input type="text" class="medicion_personalizada_unidad" placeholder="Unidad" value="' + (unidad || '') + '"></td>' +
		'<td class="medicion-desc-cell"><a class="btn-floating btn-small waves-effect waves-light red remove-medicion-personalizada"><i class="material-icons">close</i></a></td>' +
	'</tr>';
	$('#mediciones_tbody').append(html);
}

jQuery(document).on('click', '#add_medicion_personalizada', function(e){
	e.preventDefault();
	addMedicionPersonalizada('', '', '', '');
});

jQuery(document).on('click', '#add_equipo_utilizado', function(e){
	e.preventDefault();
	addEquipoUtilizadoRow('', '');
});

jQuery(document).on('click', '#add_equipos_inspector', function(e){
	e.preventDefault();
	addInspectorEquiposToForm();
});

jQuery(document).on('click', '#refresh_equipos_catalog', function(e){
	e.preventDefault();
	loadEquiposCatalog();
});

jQuery(document).on('click', '#firma_pri_clear', function(e){
	e.preventDefault();
	clearInformeFirmaPad();
});

jQuery(document).on('click', '#firma_pri_save', function(e){
	e.preventDefault();
	saveInformeFirma();
});

jQuery(document).on('click', '#firma_pri_delete', function(e){
	e.preventDefault();
	modalConfirm(
		'Eliminar firma',
		'¿Seguro que quieres eliminar la firma del informe?',
		false,
		'Eliminar',
		'Cancelar',
		'delete',
		'clear',
		function(){
			deleteInformeFirma();
		},
		function(){}
	);
});

jQuery(window).on('resize', function(){
	resizeInformeFirmaCanvas();
});

jQuery(document).on('click', '.tablink9', function(){
	setTimeout(function(){
		ensureInformeFirmaCanvasReady();
	}, 60);
});

jQuery(document).on('click', '.remove-equipo-utilizado', function(e){
	e.preventDefault();
	$(this).closest('.equipo-utilizado-row').remove();
});

jQuery(document).on('change input', '.equipo_nombre', function(){
	var label = ($(this).val() || '').trim();
	var $row = $(this).closest('.equipo-utilizado-row');
	var prox = equiposCatalogMap[label] || '';
	if(prox){
		$row.find('.equipo_proxima_calibracion').val(parseDateToInput(prox));
	}
});

function serializeMedicionesFromForm(){
	var mediciones = {};
	
	$('#mediciones_container .medicion-row[data-medicion-abrev]').each(function(){
		var abrev = $(this).data('medicion-abrev');
		var nombre = $(this).data('medicion-nombre');
		var tipo = $(this).data('medicion-tipo') || '';
		var $valorInput = $(this).find('.medicion_valor');
		var valor = $valorInput.attr('type') === 'checkbox' ? $valorInput.is(':checked') : $valorInput.val();
		var unidad = $(this).find('.medicion_unidad').length ? $(this).find('.medicion_unidad').val() : '';
		if(valor !== '' && valor !== undefined && valor !== null){
			mediciones[abrev] = {
				name: nombre,
				valor: valor,
				unidad: unidad || '',
				tipo: tipo
			};
		}
	});

	$('.medicion_personalizada_row').each(function(){
		var clave = ($(this).find('.medicion_personalizada_clave').val() || '').trim();
		var nombre = ($(this).find('.medicion_personalizada_nombre').val() || '').trim();
		var valor = $(this).find('.medicion_personalizada_valor').val();
		var unidad = $(this).find('.medicion_personalizada_unidad').val();
		var key = clave || nombre;
		if(key !== '' && valor !== '' && valor !== undefined && valor !== null){
			mediciones[key] = {
				name: nombre,
				valor: valor,
				unidad: unidad || '',
				tipo: 'MANUAL'
			};
		}
	});

	return mediciones;
}

function syncMedicionesJsonFromForm(){
	$('#mediciones_json_editor').val(JSON.stringify(serializeMedicionesFromForm(), null, 2));
}

function syncMedicionesFormFromJson(){
	var raw = $('#mediciones_json_editor').val() || '{}';
	var json;
	try {
		json = JSON.parse(raw);
	} catch(err) {
		modalError('ERROR', 'El JSON de mediciones no es valido.', false, 'Cerrar', 'error');
		return false;
	}
	if(!json || typeof json !== 'object' || Array.isArray(json)){
		modalError('ERROR', 'El JSON debe ser un objeto clave/valor.', false, 'Cerrar', 'error');
		return false;
	}

	var baseNames = {};
	$('#mediciones_container .medicion-row[data-medicion-abrev]').each(function(){
		var abrev = $(this).data('medicion-abrev');
		baseNames[abrev] = true;
		var data = json[abrev] || {};
		var $valorInput = $(this).find('.medicion_valor');
		if($valorInput.attr('type') === 'checkbox'){
			$valorInput.prop('checked', !!data.valor);
		} else {
			$valorInput.val(data.valor !== undefined && data.valor !== null ? data.valor : '');
		}
		var $unidad = $(this).find('.medicion_unidad');
		if($unidad.length){
			var unidadDefault = $unidad.attr('data-default-unidad') || '';
			$unidad.val(data.unidad !== undefined && data.unidad !== null ? data.unidad : unidadDefault);
		}
	});

	$('#mediciones_tbody .medicion_personalizada_row').remove();
	$.each(json, function(abrev, data){
		if(baseNames[abrev]) return;
		var nombreDisplay = (data && data.name) ? data.name : abrev;
		addMedicionPersonalizada(abrev, nombreDisplay, (data && data.valor !== undefined && data.valor !== null) ? data.valor : '', data && data.unidad ? data.unidad : '');
	});
	$('#mediciones_mode').formSelect();
	return true;
}

function getMedicionesMode(){
	return $('#mediciones_mode').val() || 'normal';
}

function toggleMedicionesMode(mode){
	if(mode === 'codigo'){
		syncMedicionesJsonFromForm();
		$('#mediciones_mode_normal').hide();
		$('#mediciones_mode_codigo').show();
	} else {
		if(!syncMedicionesFormFromJson()){
			$('#mediciones_mode').val('codigo');
			$('#mediciones_mode_normal').hide();
			$('#mediciones_mode_codigo').show();
			$('#mediciones_mode').formSelect();
			return;
		}
		$('#mediciones_mode_codigo').hide();
		$('#mediciones_mode_normal').show();
	}
}

jQuery(document).on('change', '#mediciones_mode', function(){
	toggleMedicionesMode($(this).val());
});

jQuery(document).on('click', '#copy_mediciones_json', function(e){
	e.preventDefault();
	var mode = getMedicionesMode();
	var jsonText = mode === 'codigo' ? ($('#mediciones_json_editor').val() || '{}') : JSON.stringify(serializeMedicionesFromForm(), null, 2);
	if(navigator.clipboard && navigator.clipboard.writeText){
		navigator.clipboard.writeText(jsonText);
	} else {
		var $tmp = $('<textarea></textarea>').css({ position:'fixed', left:'-9999px', top:'-9999px' }).val(jsonText).appendTo('body');
		$tmp[0].select();
		document.execCommand('copy');
		$tmp.remove();
	}
	M.toast({ html: 'JSON copiado' });
});

jQuery(document).on('click', '.remove-medicion-personalizada', function(e){
	e.preventDefault();
	$(this).closest('.medicion_personalizada_row').remove();
});

function serializeMediciones(){
	if(getMedicionesMode() === 'codigo'){
		try {
			var json = JSON.parse($('#mediciones_json_editor').val() || '{}');
			if(!json || typeof json !== 'object' || Array.isArray(json)){
				modalError('ERROR', 'El JSON de mediciones debe ser un objeto.', false, 'Cerrar', 'error');
				return null;
			}
			return json;
		} catch(err){
			modalError('ERROR', 'El JSON de mediciones no es valido.', false, 'Cerrar', 'error');
			return null;
		}
	}
	return serializeMedicionesFromForm();
}

function savePrimera(){
	var frm = $('#informe_frm_editar');
	if(!frm.length){
		modalError('ERROR', 'Formulario no encontrado', false, 'Cerrar', 'error');
		return;
	}

	var id = $('#id_bbdd').val();
	var mediciones = serializeMediciones();
	if(mediciones === null){
		return;
	}
	var equipos = serializeEquiposFromForm();
	if(equipos === null){
		return;
	}

	// Datos básicos del informe
	var data = {
		id: id,
		fecha_inspeccion: $('#fecha_inspeccion').val(),
		hora_ini: $('#hora_ini').val(),
		hora_fin: $('#hora_fin').val(),
		gps_latitud: $('#gps_latitud').val(),
		gps_longitud: $('#gps_longitud').val(),
		grupo: $('#grupo_pri').val(),
		estado: $('#estado_inspeccion').val(),
		resultado: $('#resultado_inspeccion').val(),
		proxima: $('#proxima_inspeccion').val(),
		industria: $('#industria_inspeccion').val(),
		enviada_cliente: $('#enviado_cliente').val(),
		observaciones: $('#observaciones_acta').val(),
		observaciones_check: $('#observaciones_hoja').val()
	};

	// Guardar informe (si existe servicio)
	$.ajax({
		url: 'services/primeras_new.php',
		type: 'POST',
		dataType: 'json',
		data: data,
		success: function(response){
			if(!response || !response.success){
				modalError('ERROR', (response && response.error) ? response.error : 'Error al guardar informe', false, 'Cerrar', 'error');
				return;
			}

			// Guardar mediciones + instalación en una sola llamada
			var allMediciones = {
				medidas: mediciones,
				instalacion: serializeInstalacionFromForm(),
				caracteristicas: serializeAscensorFromForm()
			};
			$.ajax({
				url: 'services/mediciones.php',
				type: 'POST',
				data: {
					action: 'save',
					id_informe: id,
					medidas_json: JSON.stringify(allMediciones)
				},
				success: function(response){
					var resp = (typeof response === 'string') ? JSON.parse(response) : response;
					if(resp.success){
							$.ajax({
								url: 'services/informes_equipos.php',
								type: 'POST',
								data: {
									action: 'save',
									id_informe: id,
									equipos_json: JSON.stringify(equipos)
								},
								success: function(responseEquipos){
									var respEquipos = (typeof responseEquipos === 'string') ? JSON.parse(responseEquipos) : responseEquipos;
									if(respEquipos.success){
										$('#modal_pri').modal('close');
										readInformes('pri', { filtro_total: 15 });
									} else {
										modalError('ERROR', respEquipos.error || 'Error al guardar equipos', false, 'Cerrar', 'error');
									}
								},
								error: function(){
									modalError('ERROR', 'Error al guardar equipos', false, 'Cerrar', 'error');
								}
							});
					} else {
						modalError('ERROR', resp.error || 'Error al guardar mediciones', false, 'Cerrar', 'error');
					}
				},
				error: function(){
					modalError('ERROR', 'Error al guardar mediciones', false, 'Cerrar', 'error');
				}
			});
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
						var grupos = [];
						try {
							grupos = JSON.parse(legData).resultados || [];
						} catch(err) {
							grupos = [];
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
									var allData = {};
									try {
										var resp = (typeof medData === 'string') ? JSON.parse(medData) : medData;
										allData = (resp && resp.medidas_json && typeof resp.medidas_json === 'object') ? resp.medidas_json : {};
									} catch(err) {
										allData = {};
									}
									var mediciones = allData.medidas || {};
									var instalacionData = allData.instalacion || {};
									var ascensorData = allData.caracteristicas || {};
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
						  '<div class="input-field col s2">' +
						    '<input type="time" id="hora_ini" name="hora_ini" value="' + item.hora_ini + '">' +
						    '<label for="hora_ini" class="active">Hora inicio</label>' +
						  '</div>' +
						  '<div class="input-field col s2">' +
						    '<input type="time" id="hora_fin" name="hora_fin" value="' + item.hora_fin + '">' +
						    '<label for="hora_fin" class="active">Hora fin</label>' +
						  '</div>' +
						  '<div class="input-field col s4">' +
						    '<input type="text" id="duracion_minutos" name="duracion_minutos" value="" readonly>' +
						    '<label for="duracion_minutos" class="active">Duración (min)</label>' +
						  '</div>' +
						'</div>' +
						'<div class="row">' +
						  '<div class="input-field col s2">' +
						    '<input type="text" id="gps_latitud" name="gps_latitud" value="' + item.gps_latitud + '">' +
						    '<label for="gps_latitud" class="active">GPS lat</label>' +
						  '</div>' +
						  '<div class="input-field col s2">' +
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
						'  <div class="input-field col s12">' +
						'    <select id="grupo_pri" name="grupo">' + buildGrupoOptions(grupos, item.grupo || '') + '</select>' +
						'    <label>Grupo</label>' +
						'  </div>' +
						'</div>' +
						'<div class="row">' +
						'  <div class="input-field col s6">' +
						'    <input type="text" id="legislacion_pri" name="legislacion" value="" readonly>' +
						'    <label for="legislacion_pri" class="active">Legislación</label>' +
						'  </div>' +
						'  <div class="input-field col s6">' +
						'    <input type="text" id="tipo_ascensor_pri" name="tipo_ascensor" value="" readonly>' +
						'    <label for="tipo_ascensor_pri" class="active">Tipo</label>' +
						'  </div>' +
						'</div>' +
						'<div id="instalacion_container"></div>' +
						'</div>' +
						'<div id="tab3_pri" class="col s12">' +
						'<div id="ascensor_container"></div>' +
						'</div>' +	
						'<div id="tab4_pri" class="col s12">' + 
						'<div id="mediciones_container"></div>' +
						'</div>' +	
						'<div id="tab5_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab6_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab7_pri" class="col s12">' + 
						'<div id="equipos_container"></div>' +
						'</div>' +	
										'<div id="tab8_pri" class="col s12">' + 
											'<div class="row">' +
												'<div class="input-field col s6">' +
													'<select id="estado_inspeccion" name="estado_inspeccion">' +
														'<option value="" disabled' + ((item.estado == null || item.estado === "") ? ' selected' : '') + '>Selecciona estado</option>' +
														'<option value="1"' + (item.estado == 1 ? ' selected' : '') + '>Realizada</option>' +
														'<option value="2"' + (item.estado == 2 ? ' selected' : '') + '>Pendiente</option>' +
													'</select>' +
													'<label for="estado_inspeccion" class="active">Estado inspección</label>' +
												'</div>' +
												'<div class="input-field col s6">' +
													'<select id="resultado_inspeccion" name="resultado_inspeccion">' +
														'<option value="" disabled' + ((item.resultado == null || item.resultado === "") ? ' selected' : '') + '>Selecciona resultado</option>' +
														'<option value="1"' + (item.resultado == 1 ? ' selected' : '') + '>Favorable</option>' +
														'<option value="2"' + (item.resultado == 2 ? ' selected' : '') + '>Defectos leves</option>' +
														'<option value="3"' + (item.resultado == 3 ? ' selected' : '') + '>Defectos graves</option>' +
														'<option value="4"' + (item.resultado == 4 ? ' selected' : '') + '>Defectos muy graves</option>' +
													'</select>' +
													'<label for="resultado_inspeccion" class="active">Resultado</label>' +
												'</div>' +
											'</div>' +
											'<div class="row">' +
												'<div class="input-field col s4">' +
													'<input type="date" id="proxima_inspeccion" name="proxima_inspeccion" value="' + (item.proxima ? item.proxima : '') + '">' +
													'<label for="proxima_inspeccion" class="active">Próxima inspección</label>' +
												'</div>' +
												'<div class="input-field col s4">' +
													'<input type="date" id="industria_inspeccion" name="industria_inspeccion" value="' + (item.industria ? item.industria : '') + '">' +
													'<label for="industria_inspeccion" class="active">Industria</label>' +
												'</div>' +
												'<div class="input-field col s4">' +
													'<input type="date" id="enviado_cliente" name="enviado_cliente" value="' + (item.enviada_cliente ? item.enviada_cliente : '') + '">' +
													'<label for="enviado_cliente" class="active">Enviado a cliente</label>' +
												'</div>' +
											'</div>' +
											'<div class="row">' +
												'<div class="input-field col s6">' +
													'<textarea id="observaciones_acta" name="observaciones_acta" class="materialize-textarea">' + (item.observaciones ? item.observaciones : '') + '</textarea>' +
													'<label for="observaciones_acta" class="active">Observaciones acta</label>' +
												'</div>' +
												'<div class="input-field col s6">' +
													'<textarea id="observaciones_hoja" name="observaciones_hoja" class="materialize-textarea">' + (item.observaciones_check ? item.observaciones_check : '') + '</textarea>' +
													'<label for="observaciones_hoja" class="active">Observaciones hoja de campo</label>' +
												'</div>' +
											'</div>' +
										'</div>' +
						'<div id="tab9_pri" class="col s12">' + 
						'<div id="firma_container"></div>' +
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
				  
				  // Renderizar mediciones, instalación y ascensor
				  var medicionesHtml = buildMedicionesTab4(campos, mediciones);
				  $('#mediciones_container').html(medicionesHtml);
				  $('#mediciones_container select').formSelect();
				  var instalacionHtml = buildInstalacionTab2(campos, instalacionData);
				  $('#instalacion_container').html(instalacionHtml);
				  $('#instalacion_container select').formSelect();
				  var ascensorHtml = buildAscensorTab3(campos, ascensorData);
				  $('#ascensor_container').html(ascensorHtml);
				  $('#ascensor_container select').formSelect();
						$('#equipos_container').html(buildEquiposTab7(item.equipos || {}));
						$('#firma_container').html(buildFirmaTab9(item.id || id));
						initInformeFirmaPad(item.id || id);
						loadEquiposCatalog();
						loadInspectorEquiposDefaults(item.id_usuarios || null);
				  $("#modal_"+seccion).modal({ dismissible: false });
				  $("#modal_"+seccion).modal("open");
				  syncGrupoLegislacion();
				  syncDuracionMinutos();
				  syncGoogleMapsButton();
				  $("#modal_"+seccion).find('#grupo_pri').formSelect();
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
});
