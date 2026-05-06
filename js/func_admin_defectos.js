// Funciones CRUD para administracion de defectos (check_ascensores)

var DefectosAPI = (function(){
  function request(data){
    return $.ajax({
      url: 'services/defectos.php',
      method: 'POST',
      data: data,
      dataType: 'text'
    });
  }

  return {
    list: function(filters){
      filters = filters || {};
      var payload = $.extend({ action: 'list', filtro_total: 15 }, filters);
      return request(payload);
    },
    create: function(item){
      var payload = $.extend({ action: 'create' }, item);
      return request(payload);
    },
    update: function(id, item){
      var payload = $.extend({ action: 'update', id: id }, item);
      return request(payload);
    },
    remove: function(id){
      return request({ action: 'delete', id: id });
    }
  };
})();

var DEFECTOS_LEGISLACIONES = [];

function getLegislacionAbrevs(){
  return DEFECTOS_LEGISLACIONES
    .map(function(item){ return (item && item.abrev) ? String(item.abrev).trim() : ''; })
    .filter(function(ab){ return ab !== ''; });
}

function parseAplicabilidadValue(value){
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  if (value === 'true' || value === 'TRUE') return true;
  if (value === 'false' || value === 'FALSE') return false;
  return null;
}

function buildAplicabilidadFromLegislaciones(currentObj){
  var out = {};
  var abrevs = getLegislacionAbrevs();
  var hasCurrent = currentObj && typeof currentObj === 'object';

  abrevs.forEach(function(ab){
    if (hasCurrent && Object.prototype.hasOwnProperty.call(currentObj, ab)) {
      var parsed = parseAplicabilidadValue(currentObj[ab]);
      out[ab] = (parsed === null) ? false : parsed;
    } else {
      out[ab] = false;
    }
  });

  return out;
}

function getAplicabilidadTextareaString(currentObj){
  var abrevs = getLegislacionAbrevs();
  if (abrevs.length === 0) {
    return currentObj && typeof currentObj === 'object' ? JSON.stringify(currentObj, null, 2) : '';
  }
  return JSON.stringify(buildAplicabilidadFromLegislaciones(currentObj), null, 2);
}

function getAplicabilidadAyudaHtml(){
  var abrevs = getLegislacionAbrevs();
  if (abrevs.length === 0) return '';
  return '<div class="secondary-text" style="margin-top:4px;">Legislaciones (abrev): ' + abrevs.join(', ') + '</div>';
}

function getAplicabilidadFieldHtml(textValue, labelActive){
  var labelClass = labelActive ? ' class="active"' : '';
  return '' +
    '<div class="input-field json-field-wrapper">' +
      '<a href="#!" class="btn-small waves-effect waves-light blue darken-1 json-copy-btn" id="btn_copy_aplicabilidad" title="Copiar JSON">' +
        '<i class="material-icons left">content_copy</i>Copiar JSON' +
      '</a>' +
      '<textarea id="aplicabilidad_def" class="materialize-textarea json-fixed-height" placeholder="{\n  \"ce9516e\": true\n}">' + (textValue || '') + '</textarea>' +
      '<label for="aplicabilidad_def"' + labelClass + '>Aplicabilidad (JSON)</label>' +
      getAplicabilidadAyudaHtml() +
    '</div>';
}

function readDefectos(){
  var total = parseInt($('#filtro_defectos_total').val(), 10) || 15;
  var codigo = ($('#filtro_defectos_codigo').val() || '').trim();
  var defecto = ($('#filtro_defectos_defecto').val() || '').trim();

  var filtros = { filtro_total: total };
  if (codigo) filtros.filtro_codigo = codigo;
  if (defecto) filtros.filtro_defecto = defecto;

  $('#table_defectos tbody').empty();
  $('#resultados_defectos').html('Cargando...');

  DefectosAPI.list(filtros).done(function(res){
    if (typeof res === 'string') res = JSON.parse(res);
    var datos = (res && res.resultados) ? res.resultados : [];
    var totalResultados = 0;

    datos.forEach(function(item){
      var tr = "<tr class='alto50'>";
      tr += "<td class='ancho50'>&nbsp;</td>";
      tr += "<td class='ancho30'>" + (item.id || '') + "</td>";
      tr += "<td class='ancho100'><span class='main-text'>" + (item.codigo || '') + "</span></td>";
      tr += "<td class='ancho100'>" + (item.provincia || '') + "</td>";
      tr += "<td>" + (item.defecto || '') + "</td>";
      tr += "<td class='ancho150'>" + (item.valoracion || '') + "</td>";
      tr += "<td class='ancho75'>" + (item.id_revision || '') + "</td>";
      tr += "<td class='ancho100'>" +
            "<a seccion='def' tipo='frm_editdef' data-id='" + (item.id || '') + "' class='editar_def btn-floating btn-small waves-effect waves-light green' title='Editar defecto'><i class='material-icons'>edit</i></a>" +
            "</td>";
      tr += "<td class='ancho50'>" +
            "<a class='more_def btn-floating btn-small waves-effect waves-light red' title='Mas' data-id='" + (item.id || '') + "'><i class='material-icons'>more_vert</i></a>" +
            "</td>";
      tr += "</tr>";

      $('#table_defectos tbody').append(tr);
      totalResultados++;
    });

    $('#resultados_defectos').html('<span class="main-text">Total de resultados:</span> <span class="secondary-text">' + totalResultados + '</span>');
  }).fail(function(){
    $('#resultados_defectos').html('Error cargando defectos');
  });
}

function parseAplicabilidadInput(raw){
  var txt = (raw || '').trim();
  if (txt === '') return null;
  try {
    return JSON.parse(txt);
  } catch (e) {
    return '__INVALID__';
  }
}

function saveDefecto(){
  $('#confirm-message').text('...guardando los cambios...');

  var id = $('#id_def').length ? $('#id_def').val() : '';
  var provincia = ($('#provincia_def').val() || '').trim();
  var codigo = ($('#codigo_def').val() || '').trim();
  var defecto = ($('#defecto_def').val() || '').trim();
  var id_revision = ($('#id_revision_def').val() || '').trim();
  var leve = $('#leve_def').is(':checked') ? 1 : 0;
  var grave = $('#grave_def').is(':checked') ? 1 : 0;
  var muygrave = $('#muygrave_def').is(':checked') ? 1 : 0;
  var valoracionParts = [];
  if (leve === 1) valoracionParts.push('LEVE');
  if (grave === 1) valoracionParts.push('GRAVE');
  if (muygrave === 1) valoracionParts.push('MUY GRAVE');
  var valoracion = valoracionParts.join(', ');
  var aplicabilidadRaw = ($('#aplicabilidad_def').val() || '').trim();

  var aplicabilidadObj = parseAplicabilidadInput(aplicabilidadRaw);
  if (aplicabilidadObj === '__INVALID__') {
    modalError('ERROR', 'El campo Aplicabilidad debe contener JSON valido.', false, 'Cerrar', 'warning');
    return;
  }

  if (aplicabilidadObj === null) {
    aplicabilidadObj = buildAplicabilidadFromLegislaciones({});
  } else {
    aplicabilidadObj = buildAplicabilidadFromLegislaciones(aplicabilidadObj);
  }

  var payload = {
    provincia: provincia,
    codigo: codigo,
    defecto: defecto,
    valoracion: valoracion,
    id_revision: id_revision,
    leve: leve,
    grave: grave,
    muygrave: muygrave,
    aplicabilidad: (aplicabilidadObj === null ? '' : JSON.stringify(aplicabilidadObj))
  };

  var apiCall;
  if (typeof id !== 'undefined' && id !== null && String(id).trim() !== '') {
    apiCall = DefectosAPI.update(id, payload);
  } else {
    apiCall = DefectosAPI.create(payload);
  }

  apiCall.done(function(resp){
    if ($.trim(resp) === 'OK') {
      $('#modal_confirm').modal('close');
      $('#modal_def').modal('close');
      $('#filtrar_defectos').click();
      return;
    }
    modalError('ERROR', 'Error al guardar defecto: ' + resp, false, 'Cerrar', 'error');
  }).fail(function(xhr, status, error){
    var msg = (xhr && xhr.responseText) ? (xhr.status + ' ' + (xhr.statusText || '') + ': ' + xhr.responseText) : (status + ' - ' + error);
    modalError('ERROR', 'Error en la peticion al guardar defecto. ' + msg, false, 'Cerrar', 'error');
  });
}

var openDefecto = function(seccion, cual, id){
  if (cual === 'frm_editdef') {
    DefectosAPI.list({ filtro_id: id }).done(function(res){
      if (typeof res === 'string') res = JSON.parse(res);
      DEFECTOS_LEGISLACIONES = (res && res.legislaciones) ? res.legislaciones : [];
      var datos = (res && res.resultados) ? res.resultados : [];
      if (datos.length === 0) {
        modalError('ERROR', 'No se encontro el defecto', false, 'Cerrar', 'error');
        return;
      }

      var item = datos[0];
      $('#modal_' + seccion).find('.modal_txt_title').text('Editar defecto - ' + (item.codigo || ''));
      $('#modal_' + seccion).find('.modal_txt_btn_left').html("<i class='material-icons left'>save</i>Guardar");
      $('#modal_' + seccion).find('.modal_txt_btn_right').html("<i class='material-icons left'>exit_to_app</i>Salir");

      var aplicabilidadTxt = '';
      var aplicabilidadRawEdit = item.aplicabilidad;
      var hasAplicabilidadValue = !(aplicabilidadRawEdit === null || typeof aplicabilidadRawEdit === 'undefined' || (typeof aplicabilidadRawEdit === 'string' && $.trim(aplicabilidadRawEdit) === ''));

      if (hasAplicabilidadValue) {
        if (typeof aplicabilidadRawEdit === 'object') {
          aplicabilidadTxt = getAplicabilidadTextareaString(aplicabilidadRawEdit);
        } else if (typeof aplicabilidadRawEdit === 'string') {
          var aplicabilidadRawTrim = $.trim(aplicabilidadRawEdit);
          if (aplicabilidadRawTrim.toLowerCase() === 'null') {
            aplicabilidadTxt = '';
          } else {
            try {
              aplicabilidadTxt = getAplicabilidadTextareaString(JSON.parse(aplicabilidadRawTrim));
            } catch (e) {
              aplicabilidadTxt = aplicabilidadRawTrim;
            }
          }
        }
      }

      var frm = '' +
        '<form id="defecto_frm_editar">' +
          '<div class="row">' +
            '<div class="input-field anchoFrm4 left">' +
              '<input type="text" id="provincia_def" value="' + (item.provincia || '') + '" autocomplete="off">' +
              '<label for="provincia_def" class="active">Provincia</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="text" id="codigo_def" value="' + (item.codigo || '') + '" autocomplete="off">' +
              '<label for="codigo_def" class="active">Codigo</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="number" id="id_revision_def" value="' + (item.id_revision || '') + '" autocomplete="off">' +
              '<label for="id_revision_def" class="active">ID Revision</label>' +
            '</div>' +
          '</div>' +
          '<div class="input-field">' +
            '<textarea id="defecto_def" class="materialize-textarea">' + (item.defecto || '') + '</textarea>' +
            '<label for="defecto_def" class="active">Defecto</label>' +
          '</div>' +
          '<div class="row pb-checkboxes">' +
            '<div class="input-field col s3">' +
              '<label><input type="checkbox" id="leve_def" class="filled-in" ' + ((parseInt(item.leve, 10) === 1) ? 'checked' : '') + '><span>Leve</span></label>' +
            '</div>' +
            '<div class="input-field col s3">' +
              '<label><input type="checkbox" id="grave_def" class="filled-in" ' + ((parseInt(item.grave, 10) === 1) ? 'checked' : '') + '><span>Grave</span></label>' +
            '</div>' +
            '<div class="input-field col s3">' +
              '<label><input type="checkbox" id="muygrave_def" class="filled-in" ' + ((parseInt(item.muygrave, 10) === 1) ? 'checked' : '') + '><span>Muy grave</span></label>' +
            '</div>' +
          '</div>' +
          getAplicabilidadFieldHtml(aplicabilidadTxt, true) +
          '<div class="input-field" style="display:none;">' +
            '<input type="text" id="id_def" value="' + (item.id || '') + '">' +
          '</div>' +
        '</form>';

      $('#modal_' + seccion).find('.contentForm').html(frm);
      $('#modal_' + seccion).modal({ dismissible: false });
      $('#modal_' + seccion).modal('open');
    }).fail(function(){
      modalError('ERROR', 'Error cargando defecto', false, 'Cerrar', 'error');
    });
  } else if (cual === 'frm_newdef') {
    DefectosAPI.list({ filtro_total: 1 }).done(function(resNew){
      if (typeof resNew === 'string') resNew = JSON.parse(resNew);
      DEFECTOS_LEGISLACIONES = (resNew && resNew.legislaciones) ? resNew.legislaciones : [];

      $('#modal_' + seccion).find('.modal_txt_title').text('Nuevo defecto');
      $('#modal_' + seccion).find('.modal_txt_btn_left').html("<i class='material-icons left'>save</i>Guardar");
      $('#modal_' + seccion).find('.modal_txt_btn_right').html("<i class='material-icons left'>exit_to_app</i>Salir");

      var aplicabilidadTxtNew = getAplicabilidadTextareaString({});

      var frmNew = '' +
        '<form id="defecto_frm_nuevo">' +
          '<div class="row">' +
            '<div class="input-field anchoFrm4 left">' +
              '<input type="text" id="provincia_def" value="GALICIA" autocomplete="off">' +
              '<label for="provincia_def" class="active">Provincia</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="text" id="codigo_def" value="" autocomplete="off">' +
              '<label for="codigo_def">Codigo</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="number" id="id_revision_def" value="" autocomplete="off">' +
              '<label for="id_revision_def">ID Revision</label>' +
            '</div>' +
          '</div>' +
          '<div class="input-field">' +
            '<textarea id="defecto_def" class="materialize-textarea"></textarea>' +
            '<label for="defecto_def">Defecto</label>' +
          '</div>' +
          '<div class="row pb-checkboxes">' +
            '<div class="input-field col s3">' +
              '<label><input type="checkbox" id="leve_def" class="filled-in"><span>Leve</span></label>' +
            '</div>' +
            '<div class="input-field col s3">' +
              '<label><input type="checkbox" id="grave_def" class="filled-in"><span>Grave</span></label>' +
            '</div>' +
            '<div class="input-field col s3">' +
              '<label><input type="checkbox" id="muygrave_def" class="filled-in"><span>Muy grave</span></label>' +
            '</div>' +
          '</div>' +
          getAplicabilidadFieldHtml(aplicabilidadTxtNew, true) +
        '</form>';

      $('#modal_' + seccion).find('.contentForm').html(frmNew);
      $('#modal_' + seccion).modal({ dismissible: false });
      $('#modal_' + seccion).modal('open');
      setTimeout(function(){ $('#codigo_def').focus(); }, 200);
    }).fail(function(){
      modalError('ERROR', 'No se pudo cargar legislaciones para el JSON de aplicabilidad.', false, 'Cerrar', 'error');
    });
  }
};

$(function(){
  if ($('#Defectos').length) readDefectos();

  $(document).on('click', '#filtrar_defectos', function(e){
    e.preventDefault();
    var total = parseInt($('#filtro_defectos_total').val(), 10) || 0;
    if (total >= 1) {
      readDefectos();
    } else {
      modalError('ERROR', 'Hay que introducir un numero minimo de resultados esperados! Introduce un valor en registros.', false);
    }
  });

  $(document).on('click', '#add_defectos', function(e){
    e.preventDefault();
    window.openModal('def', 'frm_newdef');
  });

  $(document).on('click', '.editar_def', function(e){
    e.preventDefault();
    var id = $(this).data('id');
    window.openModal('def', 'frm_editdef', id);
  });
});

$(document.body).on('click', '#def_save', function(){
  if ($('#modal_def').length && $('#modal_def').is(':visible')) {
    modalConfirm('Guardar defecto', 'Estas seguro de que quieres guardar los cambios?', false, 'Guardar', 'Cancelar', 'save', 'clear', function(){
      saveDefecto();
    }, function(){});
  }
});

$(document).on('click', '#btn_copy_aplicabilidad', function(e){
  e.preventDefault();
  var txt = ($('#aplicabilidad_def').val() || '').trim();
  if (!txt) {
    modalError('INFO', 'No hay contenido JSON para copiar.', false, 'Aceptar', 'info');
    return;
  }

  function onOk(){
    M.toast({ html: 'JSON copiado al portapapeles' });
  }
  function onErr(){
    modalError('ERROR', 'No se pudo copiar automaticamente. Copialo manualmente.', false, 'Aceptar', 'warning');
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(onOk).catch(onErr);
    return;
  }

  try {
    var $tmp = $('<textarea>').css({ position: 'fixed', left: '-9999px', top: '0' }).val(txt).appendTo('body');
    $tmp[0].focus();
    $tmp[0].select();
    var ok = document.execCommand('copy');
    $tmp.remove();
    if (ok) onOk(); else onErr();
  } catch (err) {
    onErr();
  }
});

jQuery(document).on('keydown', '#Defectos [id*=filtro_defectos]', function(e){
  jQuery('#filtrar_defectos_clear').removeClass('hide');
  if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
    e.preventDefault();
    jQuery(this).closest('#Defectos').find('#filtrar_defectos').click();
  }
});

jQuery(document).on('click', '#filtrar_defectos_clear', function(){
  jQuery(this).addClass('hide');
  var $parent = jQuery(this).closest('#Defectos');
  $parent.find('#filtro_defectos_codigo').val('');
  $parent.find('#filtro_defectos_defecto').val('');
  $parent.find('#filtro_defectos_total').val('15');
  $parent.find('label').not(':eq(0)').removeClass('active');
  $parent.find('#filtrar_defectos').click();
});

jQuery(document).on('click', '.more_def', function(e){
  e.preventDefault();
  jQuery('.row-menu').remove();

  var $btn = jQuery(this);
  var itemId = $btn.data('id');
  var offset = $btn.offset();

  var menuHtml = "<div class='row-menu'><ul><li class='row-menu-hide'>Ocultar fila</li>";
  menuHtml += "<li class='row-menu-delete'>Eliminar</li>";
  menuHtml += "<li class='row-menu-cancel'>Cancelar</li></ul></div>";
  var menu = jQuery(menuHtml);

  menu.css({ visibility: 'hidden', top: 0, left: 0 });
  jQuery('body').append(menu);

  var menuW = menu.outerWidth();
  var menuH = menu.outerHeight();
  var winW = jQuery(window).width();
  var winTop = jQuery(window).scrollTop();

  var desiredLeft = offset.left + $btn.outerWidth() - menuW;
  if (desiredLeft + menuW > winW - 6) desiredLeft = winW - menuW - 6;
  if (desiredLeft < 6) desiredLeft = 6;

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
    modalConfirm(
      'Eliminar defecto',
      'Eliminar defecto? Esta accion es irreversible.',
      false,
      'Eliminar',
      'Cancelar',
      'delete_forever',
      'cancel',
      function(){
        DefectosAPI.remove(itemId)
          .done(function(resp){
            if ($.trim(resp) === 'OK') {
              $('#filtrar_defectos').click();
            } else {
              modalError('Error', 'Error al eliminar: ' + resp, false, 'Cerrar', 'error');
            }
          })
          .fail(function(){
            modalError('Error', 'Error de red al intentar eliminar.', false, 'Cerrar', 'error');
          })
          .always(function(){
            menu.remove();
          });
      },
      function(){
        menu.remove();
      }
    );
  });

  menu.on('click', '.row-menu-cancel', function(ev){
    ev.stopPropagation();
    menu.remove();
  });

  setTimeout(function(){
    jQuery(document).on('click.rowMenuCloseDef', function(ev){
      if (jQuery(ev.target).closest('.row-menu').length === 0 && jQuery(ev.target).closest('.more_def').length === 0) {
        jQuery('.row-menu').remove();
        jQuery(document).off('click.rowMenuCloseDef');
      }
    });
  }, 10);
});
