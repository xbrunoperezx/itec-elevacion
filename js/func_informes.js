// Funciones relacionadas con la pestaña de informes
var equiposCatalogMap = {};
var equiposCatalogById = {};
var inspectorEquiposDefaultIds = [];
var defectosTemporales = []; // Array para almacenar defectos a agregar
var allCheckAscensores = []; // Cache de todos los check_ascensores
var firmaPadState = {
	canvas: null,
	ctx: null,
	isDrawing: false,
	hasStrokes: false,
	currentInformeId: null
};
var FIRMA_EXPORT_WIDTH = 800;
var FIRMA_EXPORT_HEIGHT = 600;
var informeFotosState = {
	currentInformeId: null,
	isBusy: false,
	dragCounter: 0
};

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

function formatFotoBytes(size){
	var n = parseInt(size, 10) || 0;
	if(n < 1024) return n + ' B';
	if(n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
	return (n / (1024 * 1024)).toFixed(2) + ' MB';
}

function buildFotosTab10(idInforme){
	var idSafe = (idInforme || '').toString();
	var html = '';
	html += '<div class="fotos-pri-wrap" data-informe-id="' + escapeHtml(idSafe) + '">';
	html += '<div id="fotos_pri_drop_hint" class="fotos-pri-drop-hint" aria-hidden="true">Suelta el archivo aqui</div>';
	html += '<div class="fotos-pri-toolbar">';
	html += '<a href="#" id="fotos_pri_pick" class="btn waves-effect waves-light blue"><i class="material-icons left">add_a_photo</i>Subir fotos</a>&nbsp;';
	html += '<a href="#" id="fotos_pri_reload" class="btn waves-effect waves-light grey"><i class="material-icons left">refresh</i>Recargar</a>&nbsp;';
	html += '<label class="fotos-pri-crop-toggle"><input type="checkbox" id="fotos_pri_crop_before" class="filled-in"><span>Recortar antes de subir</span></label>';
	html += '<input type="file" id="fotos_pri_input" accept="image/*" multiple style="display:none;">';
	html += '</div>';
	html += '<div id="fotos_pri_status" class="fotos-pri-status"></div>';
	html += '<div id="fotos_pri_grid" class="fotos-pri-grid"></div>';
	html += '</div>';
	return html;
}

function setInformeFotosStatus(text, kind){
	var $status = $('#fotos_pri_status');
	$status.removeClass('ok error work').addClass(kind || '').text(text || '');
}

function setInformeFotosBusy(busy){
	informeFotosState.isBusy = !!busy;
	$('#fotos_pri_pick').toggleClass('disabled', busy);
	$('#fotos_pri_reload').toggleClass('disabled', busy);
	$('#fotos_pri_crop_before').prop('disabled', busy);
	if(busy){
		setInformeFotosStatus('Procesando fotos...', 'work');
	}
}

function parseFotoFilename(filename){
	// Formato: inf{id_informe}-YYYY-MM-DD_HH-mm-ss_{counter}.jpg
	// Ejemplo: inf1843-2026-05-15_23-02-48_1.jpg
	var result = {
		fecha: '',
		hora: '',
		id: ''
	};
	
	// Pattern: inf\d+-(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})_(\d+)\.jpg
	var match = filename.match(/^inf\d+-(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})_(\d+)\.jpg$/i);
	if(match){
		var year = match[1], month = match[2], day = match[3];
		var hour = match[4], min = match[5], sec = match[6];
		var id = match[7];
		
		result.fecha = day + '/' + month + '/' + year; // dd/mm/YYYY
		result.hora = hour + ':' + min + ':' + sec;      // HH:mm:ss
		result.id = id;
	}
	
	return result;
}

function renderInformeFotos(list){
	var $grid = $('#fotos_pri_grid');
	$grid.empty();

	if(!list || !list.length){
		$grid.html('<div class="fotos-pri-empty">No hay fotos en este informe.</div>');
		setInformeFotosStatus('Sin fotos guardadas.', '');
		return;
	}

	$.each(list, function(_, item){
		var photoData = parseFotoFilename(item.name || '');
		var card = '';
		card += '<div class="fotos-pri-card">';
		card += '<a href="' + escapeHtml(item.url || '#') + '" target="_blank" rel="noopener noreferrer" class="fotos-pri-thumb-link">';
		card += '<img class="fotos-pri-thumb" src="' + escapeHtml(item.url || '') + '" alt="Foto informe">';
		card += '</a>';
		card += '<div class="fotos-pri-meta">';
		card += '<div class="fotos-pri-name" title="' + escapeHtml(item.name || '') + '">' + escapeHtml(item.name || '') + '</div>';
		card += '<div class="fotos-pri-size">' + escapeHtml(formatFotoBytes(item.size || 0)) + '</div>';
		if(photoData.fecha || photoData.hora){
			card += '<div class="fotos-pri-fecha">' + escapeHtml((photoData.fecha || '') + (photoData.fecha && photoData.hora ? ' - ' : '') + (photoData.hora || '')) + '</div>';
		}
		if(photoData.id){
			card += '<div class="fotos-pri-id">ID: ' + escapeHtml(photoData.id) + '</div>';
		}
		card += '</div>';
		card += '<div class="fotos-pri-actions">';
		card += '<a href="#" class="btn-floating btn-small waves-effect waves-light red foto-pri-delete" data-name="' + escapeHtml(item.name || '') + '" title="Eliminar foto"><i class="material-icons">close</i></a>';
		card += '</div>';
		card += '</div>';
		$grid.append(card);
	});

	setInformeFotosStatus('Fotos cargadas: ' + list.length, 'ok');
}

function loadInformeFotos(idInforme){
	if(!idInforme) return;
	$.ajax({
		url: 'services/informes_fotos.php',
		type: 'POST',
		dataType: 'json',
		data: {
			action: 'list',
			id_informe: idInforme
		},
		success: function(resp){
			if(resp && resp.success){
				renderInformeFotos(resp.data || []);
			} else {
				renderInformeFotos([]);
				setInformeFotosStatus((resp && resp.error) ? resp.error : 'No se pudieron cargar las fotos.', 'error');
			}
		},
		error: function(){
			renderInformeFotos([]);
			setInformeFotosStatus('Error cargando fotos.', 'error');
		}
	});
}

function createCroppedFileFromCanvas(canvas, originalName, callback){
	if(!canvas || !canvas.toBlob){
		callback(null);
		return;
	}
	canvas.toBlob(function(blob){
		if(!blob){
			callback(null);
			return;
		}
		var baseName = (originalName || 'foto').replace(/\.[^\.]+$/g, '');
		var outFile = new File([blob], baseName + '.jpg', { type: 'image/jpeg' });
		callback(outFile);
	}, 'image/jpeg', 0.92);
}

function openFotoCropper(file, callback){
	var reader = new FileReader();
	reader.onload = function(e){
		var img = new Image();
		img.onload = function(){
			var $overlay = $('<div class="foto-cropper-overlay"></div>');
			var html = '';
			html += '<div class="foto-cropper-box">';
			html += '<div class="foto-cropper-title">Recorte previo: arrastra para seleccionar área</div>';
			html += '<canvas id="foto_cropper_canvas"></canvas>';
			html += '<div class="foto-cropper-actions">';
			html += '<a href="#" id="foto_cropper_cancel" class="btn waves-effect waves-light grey">Cancelar</a>&nbsp;';
			html += '<a href="#" id="foto_cropper_original" class="btn waves-effect waves-light blue">Usar original</a>&nbsp;';
			html += '<a href="#" id="foto_cropper_apply" class="btn waves-effect waves-light green">Aplicar recorte</a>';
			html += '</div>';
			html += '</div>';
			$overlay.html(html);
			$('body').append($overlay);

			var canvas = document.getElementById('foto_cropper_canvas');
			var ctx = canvas.getContext('2d');
			var maxW = Math.min(window.innerWidth - 120, 900);
			var scale = Math.min(1, maxW / img.width);
			canvas.width = Math.max(1, Math.round(img.width * scale));
			canvas.height = Math.max(1, Math.round(img.height * scale));

			var selection = {
				x: Math.round(canvas.width * 0.1),
				y: Math.round(canvas.height * 0.1),
				w: Math.round(canvas.width * 0.8),
				h: Math.round(canvas.height * 0.8)
			};
			var dragging = false;
			var start = null;

			function clampSelection(){
				selection.x = Math.max(0, Math.min(selection.x, canvas.width - 1));
				selection.y = Math.max(0, Math.min(selection.y, canvas.height - 1));
				selection.w = Math.max(1, Math.min(selection.w, canvas.width - selection.x));
				selection.h = Math.max(1, Math.min(selection.h, canvas.height - selection.y));
			}

			function draw(){
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

				ctx.save();
				ctx.fillStyle = 'rgba(0,0,0,0.45)';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.restore();

				ctx.save();
				ctx.beginPath();
				ctx.rect(selection.x, selection.y, selection.w, selection.h);
				ctx.clip();
				ctx.clearRect(selection.x, selection.y, selection.w, selection.h);
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				ctx.restore();

				ctx.strokeStyle = '#43a047';
				ctx.setLineDash([8, 5]);
				ctx.lineWidth = 2;
				ctx.strokeRect(selection.x, selection.y, selection.w, selection.h);
				ctx.setLineDash([]);
			}

			function getPoint(evt){
				var rect = canvas.getBoundingClientRect();
				return {
					x: Math.max(0, Math.min(canvas.width, evt.clientX - rect.left)),
					y: Math.max(0, Math.min(canvas.height, evt.clientY - rect.top))
				};
			}

			canvas.onpointerdown = function(evt){
				evt.preventDefault();
				dragging = true;
				start = getPoint(evt);
				selection.x = start.x;
				selection.y = start.y;
				selection.w = 1;
				selection.h = 1;
				draw();
			};

			canvas.onpointermove = function(evt){
				if(!dragging || !start) return;
				evt.preventDefault();
				var p = getPoint(evt);
				selection.x = Math.min(start.x, p.x);
				selection.y = Math.min(start.y, p.y);
				selection.w = Math.abs(p.x - start.x);
				selection.h = Math.abs(p.y - start.y);
				clampSelection();
				draw();
			};

			canvas.onpointerup = function(){
				dragging = false;
				start = null;
			};

			canvas.onpointercancel = canvas.onpointerup;
			canvas.onpointerleave = canvas.onpointerup;

			draw();

			$overlay.on('click', '#foto_cropper_cancel', function(ev){
				ev.preventDefault();
				$overlay.remove();
				callback(null);
			});

			$overlay.on('click', '#foto_cropper_original', function(ev){
				ev.preventDefault();
				$overlay.remove();
				callback(file);
			});

			$overlay.on('click', '#foto_cropper_apply', function(ev){
				ev.preventDefault();
				if(selection.w < 5 || selection.h < 5){
					modalError('ERROR', 'Selecciona un área mayor para recortar.', false, 'Cerrar', 'error');
					return;
				}

				var srcX = Math.round((selection.x / canvas.width) * img.width);
				var srcY = Math.round((selection.y / canvas.height) * img.height);
				var srcW = Math.round((selection.w / canvas.width) * img.width);
				var srcH = Math.round((selection.h / canvas.height) * img.height);

				var out = document.createElement('canvas');
				out.width = Math.max(1, srcW);
				out.height = Math.max(1, srcH);
				var outCtx = out.getContext('2d');
				outCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, out.width, out.height);

				createCroppedFileFromCanvas(out, file.name, function(cropped){
					$overlay.remove();
					callback(cropped || file);
				});
			});
		};
		img.src = e.target.result;
	};
	reader.readAsDataURL(file);
}

function uploadInformeFoto(idInforme, file, callback){
	var formData = new FormData();
	formData.append('action', 'upload');
	formData.append('id_informe', idInforme);
	formData.append('fotos[]', file);

	$.ajax({
		url: 'services/informes_fotos.php',
		type: 'POST',
		dataType: 'json',
		data: formData,
		processData: false,
		contentType: false,
		success: function(resp){
			if(resp && resp.success){
				callback(true, null);
			} else {
				callback(false, (resp && resp.error) ? resp.error : 'No se pudo subir la foto.');
			}
		},
		error: function(){
			callback(false, 'Error subiendo foto.');
		}
	});
}

function processInformeFotosQueue(idInforme, files, index, done){
	if(index >= files.length){
		done();
		return;
	}

	var file = files[index];
	if(!isInformeFotoImageFile(file)){
		processInformeFotosQueue(idInforme, files, index + 1, done);
		return;
	}

	var withCrop = $('#fotos_pri_crop_before').is(':checked');
	var nextStep = function(finalFile){
		if(!finalFile){
			processInformeFotosQueue(idInforme, files, index + 1, done);
			return;
		}
		uploadInformeFoto(idInforme, finalFile, function(ok, errorMsg){
			if(!ok){
				setInformeFotosStatus(errorMsg || 'Error subiendo foto.', 'error');
			}
			processInformeFotosQueue(idInforme, files, index + 1, done);
		});
	};

	if(withCrop){
		openFotoCropper(file, nextStep);
	} else {
		nextStep(file);
	}
}

function initInformeFotosTab(idInforme){
	informeFotosState.currentInformeId = idInforme;
	informeFotosState.dragCounter = 0;
	setFotosDropZoneActive(false);
	setInformeFotosStatus('Cargando fotos...', 'work');
	loadInformeFotos(idInforme);
}

function isInformeFotoImageFile(file){
	if(!file) return false;
	var type = (file.type || '').toLowerCase();
	if(type.indexOf('image/') === 0) return true;
	var name = (file.name || '').toLowerCase();
	return /\.(jpg|jpeg|png|gif|webp|bmp|heic|heif|tif|tiff)$/i.test(name);
}

function splitInformeFotoFiles(files){
	var valid = [];
	var invalid = [];
	$.each(files || [], function(_, file){
		if(isInformeFotoImageFile(file)) {
			valid.push(file);
		} else {
			invalid.push(file);
		}
	});
	return { valid: valid, invalid: invalid };
}

function setFotosDropZoneActive(active){
	var isActive = !!active && !informeFotosState.isBusy;
	$('#tab10_pri .fotos-pri-wrap').toggleClass('fotos-pri-drop-zone-active', isActive);
	$('#fotos_pri_pick').toggleClass('fotos-pri-drop-active', isActive);
}

function startInformeFotosUploadFromFiles(idInforme, files){
	if(!idInforme){
		modalError('ERROR', 'No se encontró el ID del informe.', false, 'Cerrar', 'error');
		return;
	}

	if(!files || !files.length) return;

	var split = splitInformeFotoFiles(files);
	if(split.invalid.length > 0){
		setInformeFotosStatus('Solo se permiten imagenes. Ignorados: ' + split.invalid.length + ' archivo(s).', 'error');
		M.toast({ html: 'Solo se permiten imagenes' });
	}

	if(!split.valid.length){
		return;
	}

	setInformeFotosBusy(true);
	processInformeFotosQueue(idInforme, split.valid, 0, function(){
		setInformeFotosBusy(false);
		$('#fotos_pri_input').val('');
		loadInformeFotos(idInforme);
		M.toast({ html: 'Proceso de subida finalizado' });
	});
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
					"<a class='more_pri btn-floating btn-small waves-effect waves-light red' title='Más' data-id='" + item.id + "'>" +
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

function sortCamposBySubcategoryAndOrder(campos, tipo){
	var filtered = [];
	$.each(campos || [], function(idx, campo){
		if(campo.tipo === tipo){
			filtered.push(campo);
		}
	});

	filtered.sort(function(a, b){
		var subcatA = (a.subcategory || '').toString();
		var subcatB = (b.subcategory || '').toString();
		if(subcatA !== subcatB){
			return subcatA.localeCompare(subcatB);
		}
		var orderA = parseInt(a.order, 10) || 0;
		var orderB = parseInt(b.order, 10) || 0;
		return orderA - orderB;
	});
	return filtered;
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
			'<th>Categoría</th><th>Campo</th><th>Valor</th><th>Unidades</th><th>Descripción</th>' +
		'</tr></thead>' +
		'<tbody id="instalacion_tbody">';

	var camposOrdenados = sortCamposBySubcategoryAndOrder(camposData, 'INSTALACIÓN');
	$.each(camposOrdenados, function(idx, campo){
		var nombreCampo = campo.nombre || '';
		var abrevCampo = campo.abrev || nombreCampo;
		var dataType = campo.data_type || 'TEXTO NORMAL';
		var descripcion = campo.descripcion || '';
		var subcategoria = campo.subcategory || '';
		var campoData = resolveCampoData(instalacion, abrevCampo, nombreCampo);
		var valor = resolveCampoValor(campoData);
		var unidad = resolveCampoUnidad(campoData, campo.unidad || '');
		var listaValores = (campo.lista || '').split(',').map(function(v){ return v.trim(); }).filter(function(v){ return v !== ''; });

		html += '<tr class="instalacion-row" data-campo-abrev="' + abrevCampo + '" data-campo-nombre="' + nombreCampo + '" data-campo-tipo="' + dataType + '">';
		html += '<td class="medicion-categoria-cell">' + subcategoria + '</td>';
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
			'<th>Categoría</th><th>Campo</th><th>Valor</th><th>Unidades</th><th>Descripción</th>' +
		'</tr></thead>' +
		'<tbody id="ascensor_tbody">';

	var camposOrdenados = sortCamposBySubcategoryAndOrder(camposData, 'CARACTERÍSTICAS');
	$.each(camposOrdenados, function(idx, campo){
		var nombreCampo = campo.nombre || '';
		var abrevCampo = campo.abrev || nombreCampo;
		var dataType = campo.data_type || 'TEXTO NORMAL';
		var descripcion = campo.descripcion || '';
		var subcategoria = campo.subcategory || '';
		var campoData = resolveCampoData(ascensor, abrevCampo, nombreCampo);
		var valor = resolveCampoValor(campoData);
		var unidad = resolveCampoUnidad(campoData, campo.unidad || '');
		var listaValores = (campo.lista || '').split(',').map(function(v){ return v.trim(); }).filter(function(v){ return v !== ''; });

		html += '<tr class="ascensor-row" data-campo-abrev="' + abrevCampo + '" data-campo-nombre="' + nombreCampo + '" data-campo-tipo="' + dataType + '">';
		html += '<td class="medicion-categoria-cell">' + subcategoria + '</td>';
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

	html += '<div class="row mediciones-toolbar" style="align-items:center;">' +
		'<div class="col s12" style="display:flex;align-items:center;justify-content:space-between;">' +
			'<div style="display:flex;align-items:center;gap:24px;">' +
				'<div class="switch" style="margin-bottom:0;">' +
					'<label style="font-size:1em;">' +
						'Tabla' +
						'<input type="checkbox" id="mediciones_mode_switch">' +
						'<span class="lever"></span>' +
						'JSON' +
					'</label>' +
				'</div>' +
			'</div>' +
			'<a id="copy_mediciones_json" class="btn blue waves-effect waves-light"><i class="material-icons left">content_copy</i>Copiar JSON</a>' +
		'</div>' +
	'</div>';

	html += '<div id="mediciones_mode_normal">';

	html += '<table class="mediciones-table">' +
		'<thead><tr>' +
			'<th>Categoría</th><th>Clave</th><th>Medición</th><th>Valor</th><th>Unidades</th><th>Descripción</th>' +
		'</tr></thead>' +
		'<tbody id="mediciones_tbody">';

	// Campos de base de datos
	var camposOrdenados = sortCamposBySubcategoryAndOrder(camposData, 'MEDIDAS');
	$.each(camposOrdenados, function(idx, campo){

		var nombreCampo = campo.nombre || '';
		var abrevCampo = campo.abrev || nombreCampo;
		var subcategoria = campo.subcategory || '';
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
		html += '<td class="medicion-categoria-cell">' + subcategoria + '</td>';
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
			'<td class="medicion-categoria-cell"></td>' +
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
		'<td class="medicion-categoria-cell"></td>' +
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

jQuery(document).on('click', '#fotos_pri_pick', function(e){
	e.preventDefault();
	if(informeFotosState.isBusy) return;
	$('#fotos_pri_input').trigger('click');
});

jQuery(document).on('click', '#fotos_pri_reload', function(e){
	e.preventDefault();
	if(informeFotosState.isBusy) return;
	loadInformeFotos(informeFotosState.currentInformeId || $('#id_bbdd').val());
});

jQuery(document).on('change', '#fotos_pri_input', function(){
	var idInforme = informeFotosState.currentInformeId || $('#id_bbdd').val();
	var files = Array.prototype.slice.call(this.files || []);
	startInformeFotosUploadFromFiles(idInforme, files);
});

jQuery(document).on('dragenter', '#tab10_pri .fotos-pri-wrap', function(e){
	e.preventDefault();
	e.stopPropagation();
	if(informeFotosState.isBusy) return;
	informeFotosState.dragCounter = (informeFotosState.dragCounter || 0) + 1;
	setFotosDropZoneActive(true);
});

jQuery(document).on('dragover', '#tab10_pri .fotos-pri-wrap', function(e){
	e.preventDefault();
	e.stopPropagation();
});

jQuery(document).on('dragleave', '#tab10_pri .fotos-pri-wrap', function(e){
	e.preventDefault();
	e.stopPropagation();
	if(informeFotosState.isBusy) return;
	informeFotosState.dragCounter = Math.max(0, (informeFotosState.dragCounter || 0) - 1);
	if(informeFotosState.dragCounter === 0){
		setFotosDropZoneActive(false);
	}
});

jQuery(document).on('drop', '#tab10_pri .fotos-pri-wrap', function(e){
	e.preventDefault();
	e.stopPropagation();
	informeFotosState.dragCounter = 0;
	setFotosDropZoneActive(false);
	if(informeFotosState.isBusy) return;

	var idInforme = informeFotosState.currentInformeId || $('#id_bbdd').val();
	var dt = e.originalEvent ? e.originalEvent.dataTransfer : null;
	var files = Array.prototype.slice.call((dt && dt.files) ? dt.files : []);
	startInformeFotosUploadFromFiles(idInforme, files);
});

jQuery(document).on('click', '.foto-pri-delete', function(e){
	e.preventDefault();
	if(informeFotosState.isBusy) return;

	var idInforme = informeFotosState.currentInformeId || $('#id_bbdd').val();
	var filename = ($(this).data('name') || '').toString();
	if(!idInforme || !filename) return;

	modalConfirm(
		'Eliminar foto',
		'¿Seguro que quieres eliminar esta foto del informe?',
		false,
		'Eliminar',
		'Cancelar',
		'delete',
		'clear',
		function(){
			$.ajax({
				url: 'services/informes_fotos.php',
				type: 'POST',
				dataType: 'json',
				data: {
					action: 'delete',
					id_informe: idInforme,
					filename: filename
				},
				success: function(resp){
					if(resp && resp.success){
						loadInformeFotos(idInforme);
						M.toast({ html: 'Foto eliminada' });
					} else {
						modalError('ERROR', (resp && resp.error) ? resp.error : 'No se pudo eliminar la foto.', false, 'Cerrar', 'error');
					}
				},
				error: function(){
					modalError('ERROR', 'Error eliminando foto.', false, 'Cerrar', 'error');
				}
			});
		},
		function(){}
	);
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
	// No formSelect, return true
	return true;
}

function getMedicionesMode(){
	return $('#mediciones_mode_switch').is(':checked') ? 'codigo' : 'normal';
}


function toggleMedicionesMode(mode){
	if(mode === 'codigo'){
		syncMedicionesJsonFromForm();
		$('#mediciones_mode_normal').hide();
		$('#mediciones_mode_codigo').show();
		$('#mediciones_mode_switch').prop('checked', true);
	} else {
		if(!syncMedicionesFormFromJson()){
			$('#mediciones_mode_switch').prop('checked', true);
			$('#mediciones_mode_normal').hide();
			$('#mediciones_mode_codigo').show();
			return;
		}
		$('#mediciones_mode_codigo').hide();
		$('#mediciones_mode_normal').show();
		$('#mediciones_mode_switch').prop('checked', false);
	}
}

jQuery(document).on('change', '#mediciones_mode_switch', function(){
	toggleMedicionesMode($(this).is(':checked') ? 'codigo' : 'normal');
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
		acude: $('#acude_pri').val(),
		grupo: $('#grupo_pri').val(),
		estado: $('#estado_inspeccion').val(),
		resultado: $('#resultado_inspeccion').val(),
		segunda: $('#estado_cierre_inspeccion').val(),
		proxima: $('#proxima_inspeccion').val(),
		comunicada: $('#comunicada_fecha').val(),
		comunicada_aquien: $('#comunicada_destinatario').val(),
		comunicada_como: $('#comunicada_metodo').val(),
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
										// Guardar defectos
										saveDefectosInforme(id, function() {
											$('#modal_pri').modal('close');
											readInformes('pri', { filtro_total: 15 });
										});
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

// -----------------------------------------------------------------------
// Lógica de estado/bloqueo de pestañas
// -----------------------------------------------------------------------

function getInformeEstado(item){
	var horaIni = (item.hora_ini || '').trim();
	var grupo   = (item.grupo   || '').trim();
	var resultado = (item.resultado == null) ? '' : String(item.resultado).trim();
	if(resultado !== '' && resultado !== '0') return 'finalizada';
	if(!horaIni) return 'pendiente';
	if(horaIni && !grupo) return 'iniciada';
	return 'en_curso';
}

var TAB_DEFS = [
	{ num: 1,  link: 'tablink1',  href: '#tab1_pri',  title: 'Datos',                    icon: 'looks_one' },
	{ num: 2,  link: 'tablink2',  href: '#tab2_pri',  title: 'Instalación',              icon: 'business' },
	{ num: 3,  link: 'tablink3',  href: '#tab3_pri',  title: 'Ascensor',                 icon: 'code' },
	{ num: 4,  link: 'tablink4',  href: '#tab4_pri',  title: 'Mediciones realizadas',    icon: 'assignment' },
	{ num: 5,  link: 'tablink5',  href: '#tab5_pri',  title: 'Checking',                 icon: 'assignment_returned' },
	{ num: 6,  link: 'tablink6',  href: '#tab6_pri',  title: 'Defectos detectados',      icon: 'assignment_late' },
	{ num: 7,  link: 'tablink7',  href: '#tab7_pri',  title: 'Equipos',                  icon: 'business_center' },
	{ num: 8,  link: 'tablink8',  href: '#tab8_pri',  title: 'Resultado',                icon: 'assignment_turned_in' },
	{ num: 9,  link: 'tablink9',  href: '#tab9_pri',  title: 'Firma',                    icon: 'edit' },
	{ num: 10, link: 'tablink10', href: '#tab10_pri', title: 'Fotos',                    icon: 'photo_camera' },
	{ num: 11, link: 'tablink11', href: '#tab11_pri', title: 'Otros',                    icon: 'settings' }
];

// Tabs desbloqueadas por estado (11 siempre libre)
var TABS_BY_ESTADO = {
	pendiente:  [1, 11],
	iniciada:   [1, 2, 3, 11],
	en_curso:   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
	finalizada: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
};

var INFORME_STEPPER = [
	{ key: 'pendiente',  label: 'Pendiente' },
	{ key: 'iniciada',   label: 'Iniciada' },
	{ key: 'en_curso',   label: 'En curso' },
	{ key: 'finalizada', label: 'Finalizada' }
];

function buildInformeStepperHtml(estado){
	var currentIndex = 0;
	$.each(INFORME_STEPPER, function(idx, step){
		if(step.key === estado){
			currentIndex = idx;
			return false;
		}
	});

	var html = '<div id="admin_estado_stepper" class="informe-stepper" data-estado="' + estado + '">';
	$.each(INFORME_STEPPER, function(idx, step){
		var cls = 'is-pending';
		if(idx < currentIndex) cls = 'is-done';
		if(idx === currentIndex) cls = 'is-active';
		html += '<div class="informe-step ' + cls + '" data-step="' + step.key + '">' +
			'<span class="informe-step-dot">' + (idx + 1) + '</span>' +
			'<span class="informe-step-label">' + step.label + '</span>' +
		'</div>';
		if(idx < INFORME_STEPPER.length - 1){
			html += '<div class="informe-step-line ' + (idx < currentIndex ? 'is-done' : '') + '"></div>';
		}
	});
	html += '</div>';
	return html;
}

function getInformeEstadoFromForm(){
	var horaIni = ($('#hora_ini').val() || '').trim();
	var grupo = ($('#grupo_pri').val() || '').trim();
	var resultado = ($('#resultado_inspeccion').val() || '').trim();
	if(resultado !== '' && resultado !== '0') return 'finalizada';
	if(!horaIni) return 'pendiente';
	if(!grupo) return 'iniciada';
	return 'en_curso';
}

function updateInformeStepper(estado){
	var $stepper = $('#admin_estado_stepper');
	if(!$stepper.length) return;

	var currentIndex = 0;
	$.each(INFORME_STEPPER, function(idx, step){
		if(step.key === estado){
			currentIndex = idx;
			return false;
		}
	});

	$stepper.attr('data-estado', estado);
	$stepper.find('.informe-step').each(function(idx){
		var cls = 'is-pending';
		if(idx < currentIndex) cls = 'is-done';
		if(idx === currentIndex) cls = 'is-active';
		$(this).removeClass('is-pending is-done is-active').addClass(cls);
	});
	$stepper.find('.informe-step-line').each(function(idx){
		$(this).toggleClass('is-done', idx < currentIndex);
	});
}

function refreshInformeEstadoUIFromForm(){
	var estado = getInformeEstadoFromForm();
	updateInformeStepper(estado);
	applyInformeEstadoTabs(estado);
	$('#modal_pri .tabs').tabs();
}

function buildFrmTabs(estado){
	var allowed = TABS_BY_ESTADO[estado] || [1, 11];
	var html = '<ul class="tabs modalEditar">';
	$.each(TAB_DEFS, function(_, t){
		var locked = allowed.indexOf(t.num) === -1;
		var linkClass = (t.num === 1 ? 'active ' : '') + t.link + (locked ? ' tab-link-locked' : '');
		if(locked){
			html += '<li class="tab col s3 tab-locked">' +
				'<a class="' + linkClass + '" href="' + t.href + '" data-tab="' + t.href + '" title="' + t.title + ' (bloqueado)">' +
				'<i class="material-icons left">lock</i></a></li>';
		} else {
			html += '<li class="tab col s3">' +
				'<a class="' + linkClass + '" href="' + t.href + '" title="' + t.title + '">' +
				'<i class="material-icons left">' + t.icon + '</i></a></li>';
		}
	});
	html += '</ul>';
	return html;
}

function applyInformeEstadoTabs(estado){
	var allowed = TABS_BY_ESTADO[estado] || [1, 11];
	$.each(TAB_DEFS, function(_, t){
		var locked = allowed.indexOf(t.num) === -1;
		var $li = $('#modal_pri .tabs .' + t.link).closest('li');
		if(locked){
			$li.addClass('tab-locked');
			$li.find('a').addClass('tab-link-locked').attr('href', t.href).attr('title', t.title + ' (bloqueado)').html('<i class="material-icons left">lock</i>');
		} else {
			$li.removeClass('tab-locked');
			$li.find('a').removeClass('tab-link-locked').attr('href', t.href).attr('title', t.title).html('<i class="material-icons left">' + t.icon + '</i>');
		}
	});
}

jQuery(document).on('click', '#modal_pri .tab-link-locked', function(e){
	e.preventDefault();
	e.stopImmediatePropagation();
	M.toast({ html: 'Esta pestaña no está disponible aún' });
});

jQuery(document).on('click', '#btn_iniciar_inspeccion', function(e){
	e.preventDefault();
	var now = new Date();
	var hh = String(now.getHours()).padStart(2, '0');
	var mm = String(now.getMinutes()).padStart(2, '0');
	var horaIni = hh + ':' + mm;
	var idInforme = $('#id_bbdd').val();
	if(!idInforme){
		M.toast({ html: 'No se ha podido identificar el informe' });
		return;
	}

	var guardarInicio = function(lat, lon){
		$.ajax({
			url: 'services/primeras_iniciar.php',
			type: 'POST',
			dataType: 'json',
			data: {
				id_informe: idInforme,
				hora_ini: horaIni,
				gps_latitud: lat || '',
				gps_longitud: lon || ''
			},
			success: function(resp){
				if(resp && resp.error){
					M.toast({ html: resp.error });
					return;
				}

				if(resp && resp.gps_latitud !== undefined){
					$('#gps_latitud').val(resp.gps_latitud || '').trigger('input');
				}
				if(resp && resp.gps_longitud !== undefined){
					$('#gps_longitud').val(resp.gps_longitud || '').trigger('input');
				}
				$('#hora_ini').val(horaIni).trigger('change');
				$('#tab1_pri .tab1-full-fields').show();
				$('#btn_iniciar_inspeccion').closest('.row').hide();
				syncGoogleMapsButton();
				refreshInformeEstadoUIFromForm();
				M.toast({ html: 'Inspección iniciada: ' + horaIni });
			},
			error: function(){
				M.toast({ html: 'No se pudo guardar el inicio de inspección' });
			}
		});
	};

	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(position){
			var lat = String(position.coords.latitude);
			var lon = String(position.coords.longitude);
			guardarInicio(lat, lon);
		}, function(){
			guardarInicio($('#gps_latitud').val() || '', $('#gps_longitud').val() || '');
		}, {
			enableHighAccuracy: true,
			timeout: 8000,
			maximumAge: 0
		});
	} else {
		guardarInicio($('#gps_latitud').val() || '', $('#gps_longitud').val() || '');
	}
});

jQuery(document).on('change', '#grupo_pri, #resultado_inspeccion, #hora_ini', function(){
	if(!$('#modal_pri').is(':visible')) return;
	refreshInformeEstadoUIFromForm();
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
				var comunicadaFecha = (item.comunicada && item.comunicada !== '-') ? parseDateToInput(item.comunicada) : '';
				var comunicadaDestinatario = item.comunicada_aquien || '';
				var comunicadaMetodo = item.comunicada_como || '';
				var title = " Editar informe " + item.informe + "| RAE: "+item.contratada.cliente.rae;
					$("#modal_"+seccion).find(".modal_txt_title").text(title);
					$("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
					$("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");
					var informeEstado = getInformeEstado(item);
					var informeStepperHtml = buildInformeStepperHtml(informeEstado);
					var frm_tabs = buildFrmTabs(informeEstado);
					var frm_render = '<form id="informe_frm_editar">' + 
						'<div id="tab1_pri" class="col s12">' + 
						'<div class="row">' +
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
						(informeEstado === 'pendiente' ?
						  '<div class="col s4" style="padding-top:10px;">' +
						    '<a href="#" id="btn_iniciar_inspeccion" class="btn waves-effect waves-light blue"><i class="material-icons left">play_arrow</i>Iniciar Inspección</a>' +
						  '</div>'
						: '') +
						'</div>' +
						'<div id="tab1_full_fields" class="tab1-full-fields"' + (informeEstado === 'pendiente' ? ' style="display:none;"' : '') + '>' +
						'<div class="row">' +
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
						'<div class="row">' +
						  '<div class="input-field col s6">' +
						    '<input type="text" id="acude_pri" name="acude" value="' + (item.acude || '') + '">' +
						    '<label for="acude_pri" class="active">Acompaña</label>' +
						  '</div>' +
						  '<div class="input-field col s6">' +
						    '<input type="text" id="mantenedor_pri" name="mantenedor" value="' + ((item.contratada && item.contratada.cliente && item.contratada.cliente.mantenedor) ? item.contratada.cliente.mantenedor : '') + '" disabled>' +
						    '<label for="mantenedor_pri" class="active">Mantenedor</label>' +
						  '</div>' +
						'</div>' +
						'<div class="row">' +
						  '<div class="input-field col s4">' +
						    '<input type="date" id="comunicada_fecha" name="comunicada_fecha" value="' + comunicadaFecha + '">' +
						    '<label for="comunicada_fecha" class="active">Comunicada fecha</label>' +
						  '</div>' +
						  '<div class="input-field col s4">' +
						    '<input type="text" id="comunicada_destinatario" name="comunicada_destinatario" value="' + comunicadaDestinatario + '">' +
						    '<label for="comunicada_destinatario" class="active">Destinatario</label>' +
						  '</div>' +
						  '<div class="input-field col s4">' +
						    '<input type="text" id="comunicada_metodo" name="comunicada_metodo" value="' + comunicadaMetodo + '">' +
						    '<label for="comunicada_metodo" class="active">Método de comunicación</label>' +
						  '</div>' +
						'</div>' +
						'</div>' + // end tab1_full_fields
						'</div>' +	// end tab1_pri
						'<div id="tab2_pri" class="col s12">' +
						'<div class="row">' +
						'  <div class="input-field col s12">' +
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
						'<div class="row">' +
							'<div class="col s12">' +
								'<table class="highlight bordered" id="table_defectos_pri">' +
									'<thead>' +
										'<tr>' +
											'<th style="width:60px">Orden</th>' +
											'<th style="width:60px">Editar</th>' +
											'<th>Código</th>' +
											'<th>Descripción</th>' +
											'<th>Valoración</th>' +
											'<th>Acciones</th>' +
										'</tr>' +
									'</thead>' +
									'<tbody>' +
										'<tr>' +
											'<td>-</td>' +
											'<td>-</td>' +
											'<td>-</td>' +
											'<td>No se han añadido defectos</td>' +
											'<td>-</td>' +
											'<td>-</td>' +
										'</tr>' +
									'</tbody>' +
								'</table>' +
							'</div>' +
						'</div>' +
						'<div class="row" style="margin-bottom: 15px; margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">' +
							'<div class="col s12">' +
								'<button class="btn waves-effect waves-light green" id="btn_agregar_defecto"><i class="material-icons left">add</i>Agregar Defecto</button>' +
							'</div>' +
						'</div>' +
						'<div class="row">' +
							'<div class="input-field col s2">' +
								'<input type="text" id="defecto_codigo_edit" placeholder="Ej: 1.01.1">' +
								'<label for="defecto_codigo_edit" class="active">Código</label>' +
							'</div>' +
						'</div>' +
						'<div class="row">' +
							'<div class="input-field col s12">' +
								'<input type="text" id="defecto_descripcion_edit" placeholder="Descripción del defecto">' +
								'<label for="defecto_descripcion_edit" class="active">Descripción</label>' +
							'</div>' +
						'</div>' +
						'<div class="row">' +
							'<div class="input-field col s2">' +
								'<input type="text" id="defecto_valoracion_edit" placeholder="LEVE" readonly>' +
								'<label for="defecto_valoracion_edit" class="active">Valoración</label>' +
							'</div>' +
							'<div class="col s10" style="padding-top: 10px;">' +
								'<button class="btn waves-effect waves-light btn-small" id="btn_leve" style="background-color: #4CAF50; padding: 4px 8px; font-size: 11px; margin-right: 5px; height: auto; width: 90px;">LEVE</button>' +
								'<button class="btn waves-effect waves-light btn-small" id="btn_grave" style="background-color: #FFC107; color: black; padding: 4px 8px; font-size: 11px; margin-right: 5px; height: auto; width: 90px;">GRAVE</button>' +
								'<button class="btn waves-effect waves-light btn-small" id="btn_muyg" style="background-color: #F44336; padding: 4px 8px; font-size: 11px; height: auto; width: 90px;">MUY GRAVE</button>' +
							'</div>' +
						'</div>' +
						'<div class="row">' +
							'<div class="input-field col s12">' +
								'<input type="text" id="defecto_buscar" placeholder="Buscar por código o descripción...">' +
								'<label for="defecto_buscar" class="active">Buscar Defectos</label>' +
								'<div id="defecto_buscar_resultados" style="position: absolute; background: white; border: 1px solid #ccc; max-height: 300px; overflow-y: auto; width: 100%; display: none; z-index: 10;"></div>' +
								'<div style="height:200px;"></div>' +
							'</div>' +
						'</div>' +
						'</div>' +	
						'<div id="tab7_pri" class="col s12">' + 
						'<div id="equipos_container"></div>' +
						'</div>' +	
										'<div id="tab8_pri" class="col s12">' + 
											'<div class="row">' +
												'<div class="input-field col s4">' +
													'<select id="estado_inspeccion" name="estado_inspeccion">' +
															'<option value="" disabled' + ((item.estado == null || item.estado === "") ? ' selected' : '') + '>Selecciona estado</option>' +
															'<option value="0"' + (item.estado == 0 ? ' selected' : '') + '>Pendiente</option>' +
															'<option value="1"' + (item.estado == 1 ? ' selected' : '') + '>En curso</option>' +
															'<option value="2"' + (item.estado == 2 ? ' selected' : '') + '>Inspección realizada</option>' +
															'<option value="3"' + (item.estado == 3 ? ' selected' : '') + '>Enviada a facturación</option>' +
														'</select>' +
														'<label for="estado_inspeccion" class="active">Estado</label>' +
												'</div>' +
												'<div class="input-field col s4">' +
													'<select id="resultado_inspeccion" name="resultado_inspeccion">' +
															'<option value="0"' + (item.resultado == 0 || item.resultado === null || item.resultado === "" ? ' selected' : '') + '>---</option>' +
															'<option value="1"' + (item.resultado == 1 ? ' selected' : '') + '>Favorable</option>' +
															'<option value="2"' + (item.resultado == 2 ? ' selected' : '') + '>Defectos leves</option>' +
															'<option value="3"' + (item.resultado == 3 ? ' selected' : '') + '>Defectos graves</option>' +
															'<option value="4"' + (item.resultado == 4 ? ' selected' : '') + '>Defectos muy graves</option>' +
														'</select>' +
														'<label for="resultado_inspeccion" class="active">Resultado de la inspección</label>' +
												'</div>' +
												'<div class="input-field col s4">' +
													'<select id="estado_cierre_inspeccion" name="estado_cierre_inspeccion">' +
															'<option value="0"' + (item.segunda == 0 || item.segunda === null || item.segunda === "" ? ' selected' : '') + '>---</option>' +
															'<option value="1"' + (item.segunda == 1 ? ' selected' : '') + '>Abierta, pendiente de nueva visita</option>' +
															'<option value="2"' + (item.segunda == 2 ? ' selected' : '') + '>Cerrada, sin seguimiento pendiente</option>' +
														'</select>' +
														'<label for="estado_cierre_inspeccion" class="active">Estado de cierre</label>' +
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
						'<div class="row">' +
						  '<div class="input-field col s4">' +
						    '<input type="text" id="id_bbdd" name="id_bbdd" value="' + item.id + '" disabled>' +
						    '<label for="id_bbdd" class="active">ID BBDD</label>' +
						  '</div>' +
						'</div>' +
						'</div>' +	
 					'</form>';
				  var $modal = $("#modal_"+seccion);
				  $modal.find('.contentStepper').remove();
				  $modal.find('.contentTabs').before(
					'<div class="contentStepper">' +
					  '<div class="row">' +
					    '<div class="col s12">' +
					      '<h6 class="admin-estado-title">Estado del informe</h6>' +
					      informeStepperHtml +
					    '</div>' +
					  '</div>' +
					'</div>'
				  );
				  $modal.find(".contentTabs").html(frm_tabs);
				  $modal.find(".contentForm").html(frm_render);
				  $modal.find('.tabs').tabs();
				  $modal.find('select').formSelect();
				  
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
						$('#tab10_pri').html(buildFotosTab10(item.id || id));
						initInformeFirmaPad(item.id || id);
						initInformeFotosTab(item.id || id);
						loadEquiposCatalog();
						loadInspectorEquiposDefaults(item.id_usuarios || null);
				  $("#modal_"+seccion).modal({ dismissible: false });
				  $("#modal_"+seccion).modal("open");
				  // Inicializar defectos
				  loadDefectosInforme(item.id || id);
				  initDefectoSearch();
				  initValorationButtons();
				  initAddDefectoButton();
				  syncGrupoLegislacion();
				  syncDuracionMinutos();
				  syncGoogleMapsButton();
				  refreshInformeEstadoUIFromForm();
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

// Menú contextual para cada fila de informes (ocultar fila / eliminar / cancelar)
jQuery(document).on("click", ".more_pri", function(e){
	e.preventDefault();
	jQuery('.row-menu').remove();

	var $btn = jQuery(this);
	var itemId = parseInt($btn.data('id'), 10) || 0;
	var offset = $btn.offset();

	var menu = jQuery("<div class='row-menu'><ul><li class='row-menu-hide'>Ocultar fila</li><li class='row-menu-delete' data-id='" + itemId + "'>Eliminar</li><li class='row-menu-cancel'>Cancelar</li></ul></div>");

	menu.css({ visibility: 'hidden', top: 0, left: 0 });
	jQuery('body').append(menu);

	var menuW = menu.outerWidth();
	var menuH = menu.outerHeight();
	var winW = jQuery(window).width();
	var winTop = jQuery(window).scrollTop();

	var desiredLeft = offset.left + $btn.outerWidth() - menuW;
	if (desiredLeft + menuW > winW - 6) {
		desiredLeft = winW - menuW - 6;
	}
	if (desiredLeft < 6) {
		desiredLeft = 6;
	}

	var desiredTop = offset.top + $btn.outerHeight() + 6;
	if (desiredTop + menuH > winTop + jQuery(window).height()) {
		desiredTop = offset.top - menuH - 6;
		if (desiredTop < winTop + 6) desiredTop = winTop + 6;
	}

	menu.css({ top: desiredTop + 'px', left: desiredLeft + 'px', visibility: 'visible' });

	menu.on('click', '.row-menu-hide', function(ev){
		ev.stopPropagation();
		$btn.closest('tr').addClass('hidden-row');
		menu.remove();
	});

	menu.on('click', '.row-menu-delete', function(ev){
		ev.stopPropagation();
		var idInforme = parseInt(jQuery(this).data('id'), 10) || 0;
		menu.remove();
		if(idInforme <= 0){
			modalError('ERROR', 'ID de informe no válido para eliminar.', false, 'Cerrar', 'error');
			return;
		}

		modalConfirm(
			'Eliminar informe',
			'¿Desea eliminar el informe con ID' + idInforme + ' de la base de datos?',
			false,
			'Eliminar',
			'Cancelar',
			'delete_forever',
			'cancel',
			function(){
				$.ajax({
					url: 'services/primeras_delete.php',
					type: 'POST',
					data: { id: idInforme },
					success: function(data){
						var text = (data == null) ? '' : String(data).trim();
						if(text === 'OK'){
							$btn.closest('tr').remove();
							jQuery('#filtrar_pri').click();
							return;
						}
						if(text.indexOf('KO: sesión') === 0 || text.indexOf('KO: sesion') === 0){
							window.location.href = 'login.html';
							return;
						}
						modalError('ERROR', 'No se pudo eliminar el informe: ' + text, false, 'Cerrar', 'error');
					},
					error: function(xhr, status, error){
						modalError('ERROR', 'Error eliminando informe: ' + error, false, 'Cerrar', 'error');
					}
				});
			}
		);
	});

	menu.on('click', '.row-menu-cancel', function(ev){
		ev.stopPropagation();
		menu.remove();
	});

	setTimeout(function(){
		jQuery(document).on('click.rowMenuClose', function(ev){
			if(jQuery(ev.target).closest('.row-menu').length===0 && jQuery(ev.target).closest('.more_pri').length===0){
				jQuery('.row-menu').remove();
				jQuery(document).off('click.rowMenuClose');
			}
		});
	}, 10);
});

// ========== FUNCIONES PARA GESTIÓN DE DEFECTOS EN INFORME ==========

/**
 * Cargar y mostrar defectos existentes para una inspección
 */
function loadDefectosInforme(idInforme) {
	defectosTemporales = [];
	var $tbody = $('#table_defectos_pri tbody');
	$tbody.empty();
	
	// Cargar defectos del servidor
	$.ajax({
		url: 'services/informes_defectos.php',
		type: 'POST',
		dataType: 'json',
		data: {
			action: 'list_by_informe',
			id_informe: idInforme
		},
		success: function(response) {
			if (response && response.success && response.data) {
				defectosTemporales = response.data;
				renderDefectosTable();
			}
		},
		error: function() {
			console.log('Error loading defectos');
		}
	});
}

/**
 * Guardar defectos de un informe
 */
function saveDefectosInforme(idInforme, callback) {
	$.ajax({
		url: 'services/informes_defectos.php',
		type: 'POST',
		dataType: 'json',
		data: {
			action: 'save',
			id_informe: idInforme,
			defectos_json: JSON.stringify(defectosTemporales)
		},
		success: function(response) {
			if (response && response.success) {
				if (typeof callback === 'function') {
					callback();
				}
			} else {
				modalError('ERROR', response && response.error ? response.error : 'Error al guardar defectos', false, 'Cerrar', 'error');
			}
		},
		error: function() {
			modalError('ERROR', 'Error al guardar defectos', false, 'Cerrar', 'error');
		}
	});
}

/**
 * Renderizar la tabla de defectos
 */
function renderDefectosTable() {
	var $tbody = $('#table_defectos_pri tbody');
	$tbody.empty();
	
	if (defectosTemporales.length === 0) {
		// Mostrar fila por defecto cuando no hay defectos
		var row = '<tr>';
		row += '<td>-</td>';
		row += '<td>No se han añadido defectos</td>';
		row += '<td>-</td>';
		row += '<td>-</td>';
		row += '</tr>';
		$tbody.append(row);
	} else {
		// Mostrar defectos
		defectosTemporales.forEach(function(defecto, idx) {
			var isFirst = idx === 0;
			var isLast = idx === defectosTemporales.length - 1;
			var row = '<tr>';
			row += '<td style="white-space:nowrap">';
			row += '<button class="btn-flat btn-small move-defecto-up" data-index="' + idx + '" ' + (isFirst ? 'disabled' : '') + ' style="padding:0 4px;min-width:auto"><i class="material-icons" style="font-size:18px">arrow_upward</i></button>';
			row += '<button class="btn-flat btn-small move-defecto-down" data-index="' + idx + '" ' + (isLast ? 'disabled' : '') + ' style="padding:0 4px;min-width:auto"><i class="material-icons" style="font-size:18px">arrow_downward</i></button>';
			row += '</td>';
			row += '<td style="text-align:center"><button class="btn-floating btn-small waves-effect waves-light green edit-defecto" data-index="' + idx + '" title="Editar"><i class="material-icons">edit</i></button></td>';
			row += '<td>' + (defecto.codigo || '') + '</td>';
			row += '<td>' + (defecto.descripcion || '') + '</td>';
			row += '<td>' + (defecto.valoracion || '') + '</td>';
			row += '<td style="white-space:nowrap">';
			row += '<button class="btn-floating btn-small waves-effect waves-light red delete-defecto" data-index="' + idx + '" title="Eliminar"><i class="material-icons">close</i></button>';
			row += '</td>';
			row += '</tr>';
			$tbody.append(row);
		});
	}
	
	// Mover arriba
	$tbody.off('click', '.move-defecto-up').on('click', '.move-defecto-up', function(e) {
		e.preventDefault();
		var idx = parseInt($(this).data('index'));
		if (idx > 0) {
			var tmp = defectosTemporales[idx - 1];
			defectosTemporales[idx - 1] = defectosTemporales[idx];
			defectosTemporales[idx] = tmp;
			renderDefectosTable();
		}
	});

	// Mover abajo
	$tbody.off('click', '.move-defecto-down').on('click', '.move-defecto-down', function(e) {
		e.preventDefault();
		var idx = parseInt($(this).data('index'));
		if (idx < defectosTemporales.length - 1) {
			var tmp = defectosTemporales[idx + 1];
			defectosTemporales[idx + 1] = defectosTemporales[idx];
			defectosTemporales[idx] = tmp;
			renderDefectosTable();
		}
	});

	// Editar defecto
	$tbody.off('click', '.edit-defecto').on('click', '.edit-defecto', function(e) {
		e.preventDefault();
		var idx = parseInt($(this).data('index'));
		var defecto = defectosTemporales[idx];
		$('#defecto_codigo_edit').val(defecto.codigo || '');
		$('#defecto_descripcion_edit').val(defecto.descripcion || '');
		$('#defecto_valoracion_edit').val(defecto.valoracion || '');
		defectosTemporales.splice(idx, 1);
		renderDefectosTable();
	});

	// Eliminar defecto
	$tbody.off('click', '.delete-defecto').on('click', '.delete-defecto', function(e) {
		e.preventDefault();
		var idx = $(this).data('index');
		modalConfirm(
			'Eliminar defecto',
			'¿Seguro que quieres eliminar este defecto?',
			false,
			'Eliminar',
			'Cancelar',
			'close',
			'clear',
			function() {
				defectosTemporales.splice(idx, 1);
				renderDefectosTable();
			},
			function() {}
		);
	});
}

/**
 * Buscar defectos en catálogo
 */
function initDefectoSearch() {
	// Cargar todos los defectos si no están cargados
	if (allCheckAscensores.length === 0) {
		$.ajax({
			url: 'services/informes_defectos.php',
			type: 'POST',
			dataType: 'json',
			data: { action: 'list_check_ascensores' },
			success: function(response) {
				if (response && response.data) {
					allCheckAscensores = response.data;
				}
			}
		});
	}
	
	// Búsqueda en tiempo real
	$('#defecto_buscar').off('keyup').on('keyup', function() {
		var searchTerm = $(this).val().toLowerCase();
		var $resultados = $('#defecto_buscar_resultados');
		
		if (searchTerm.length < 2) {
			$resultados.empty().hide();
			return;
		}
		
		var filtered = allCheckAscensores.filter(function(item) {
			var codigo = String(item.codigo || '').toLowerCase();
			var defecto = String(item.defecto || '').toLowerCase();
			return codigo.includes(searchTerm) || defecto.includes(searchTerm);
		});
		
		var html = '';
		if (filtered.length === 0) {
			html = '<div style="padding: 10px; color: #999;">No hay resultados</div>';
		} else {
			filtered.slice(0, 10).forEach(function(item) {
				html += '<div class="defecto-item" data-codigo="' + (item.codigo || '') + '" data-defecto="' + (item.defecto || '') + '" data-valoracion="' + (item.valoracion || '') + '" style="padding: 8px; border-bottom: 1px solid #f0f0f0; cursor: pointer;">';
				html += '<strong>' + (item.codigo || '') + '</strong> - ' + (item.defecto || '');
				html += '</div>';
			});
		}
		
		$resultados.html(html).show();
		
		// Manejador de clics en resultados
		$resultados.off('click', '.defecto-item').on('click', '.defecto-item', function() {
			var codigo = $(this).data('codigo');
			var defecto = $(this).data('defecto');
			var valoracion = $(this).data('valoracion');
			$('#defecto_codigo_edit').val(codigo);
			$('#defecto_descripcion_edit').val(defecto);
			$('#defecto_valoracion_edit').val(valoracion);
			$resultados.empty().hide();
		});
	});
	
	// Cerrar resultados al hacer clic fuera
	$(document).off('click.defectoSearch').on('click.defectoSearch', function(e) {
		if (!$(e.target).closest('#defecto_buscar').length && !$(e.target).closest('#defecto_buscar_resultados').length) {
			$('#defecto_buscar_resultados').empty().hide();
		}
	});
}

/**
 * Inicializar botones de valoración rápida
 */
function initValorationButtons() {
	$('#btn_leve').off('click').on('click', function(e) {
		e.preventDefault();
		$('#defecto_valoracion_edit').val('LEVE');
	});
	
	$('#btn_grave').off('click').on('click', function(e) {
		e.preventDefault();
		$('#defecto_valoracion_edit').val('GRAVE');
	});
	
	$('#btn_muyg').off('click').on('click', function(e) {
		e.preventDefault();
		$('#defecto_valoracion_edit').val('MUY GRAVE');
	});
}

/**
 * Agregar defecto a la tabla temporal
 */
function initAddDefectoButton() {
	$('#btn_agregar_defecto').off('click').on('click', function(e) {
		e.preventDefault();
		
		var codigo = $('#defecto_codigo_edit').val().trim();
		var descripcion = $('#defecto_descripcion_edit').val().trim();
		var valoracion = $('#defecto_valoracion_edit').val().trim();
		
		if (!codigo || !descripcion) {
			alert('Debe especificar código y descripción del defecto');
			return;
		}
		
		if (!valoracion) {
			alert('Debe especificar la valoración del defecto');
			return;
		}
		
		defectosTemporales.push({
			codigo: codigo,
			descripcion: descripcion,
			valoracion: valoracion
		});
		
		// Limpiar formulario
		$('#defecto_codigo_edit').val('');
		$('#defecto_descripcion_edit').val('');
		$('#defecto_valoracion_edit').val('');
		$('#defecto_buscar').val('').focus();
		
		renderDefectosTable();
	});
}
