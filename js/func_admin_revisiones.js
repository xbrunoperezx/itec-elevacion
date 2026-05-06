// Funciones CRUD para administracion de revisiones

var RevisionesAPI = (function(){
  function request(data){
    return $.ajax({
      url: 'services/revisiones.php',
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

var DOMINIOS_REVISION = [
  'INFORME MEDIDAS',
  'INFORME CARACTERISTICAS',
  'CHECKLIST',
  'INFORME ACTA',
  'INFORME HOJA DE CAMPO'
];

function buildDominioOptions(selected){
  var html = '<option value="" disabled' + (!selected ? ' selected' : '') + '>Selecciona dominio</option>';
  DOMINIOS_REVISION.forEach(function(d){
    var sel = (d === selected) ? ' selected' : '';
    html += '<option value="' + d + '"' + sel + '>' + d + '</option>';
  });
  return html;
}

function buildRevisionForm(item){
  item = item || {};
  var isEdit = !!(item.id);
  var activaChecked = (item.activa == 1) ? 'checked' : '';
  var idField = isEdit ? '<div class="input-field" style="display:none;"><input type="text" id="id_rev" value="' + item.id + '"></div>' : '';

  return '' +
    '<form id="revision_frm">' +
      idField +
      '<div class="input-field">' +
        '<select id="rev_dominio">' +
          buildDominioOptions(item.dominio || '') +
        '</select>' +
        '<label>Dominio</label>' +
      '</div>' +
      '<div class="row">' +
        '<div class="input-field col s8">' +
          '<input type="text" id="rev_revision" value="' + (item.revision || '') + '" autocomplete="off">' +
          '<label for="rev_revision"' + (isEdit ? ' class="active"' : '') + '>Revisión</label>' +
        '</div>' +
        '<div class="input-field col s4">' +
          '<input type="number" id="rev_numero" value="' + (item.numero !== undefined ? item.numero : '') + '" autocomplete="off">' +
          '<label for="rev_numero"' + (isEdit ? ' class="active"' : '') + '>Número</label>' +
        '</div>' +
      '</div>' +
      '<div class="input-field">' +
        '<textarea id="rev_descripcion" class="materialize-textarea">' + (item.descripcion || '') + '</textarea>' +
        '<label for="rev_descripcion"' + (isEdit ? ' class="active"' : '') + '>Descripción</label>' +
      '</div>' +
      '<div class="input-field">' +
        '<input type="date" id="rev_entrada_vigor" value="' + (item.entrada_vigor || '') + '" class="datepicker-native">' +
        '<label for="rev_entrada_vigor" class="active">Entrada en vigor</label>' +
      '</div>' +
      '<p>' +
        '<label>' +
          '<input type="checkbox" id="rev_activa" value="1" ' + activaChecked + '>' +
          '<span>Activa</span>' +
        '</label>' +
      '</p>' +
    '</form>';
}

function readRevisiones(){
  var total  = parseInt($('#filtro_revisiones_total').val(), 10) || 15;
  var nombre = ($('#filtro_revisiones_nombre').val() || '').trim();

  var filtros = { filtro_total: total };
  if (nombre) filtros.filtro_nombre = nombre;

  $('#table_revisiones tbody').empty();
  $('#resultados_revisiones').html('Cargando...');

  RevisionesAPI.list(filtros).done(function(res){
    if (typeof res === 'string') res = JSON.parse(res);
    var datos = (res && res.resultados) ? res.resultados : [];
    var totalResultados = 0;

    datos.forEach(function(item){
      var activaBadge = (item.activa == 1)
        ? '<span class="new badge green" data-badge-caption="activa"></span>'
        : '<span class="new badge grey" data-badge-caption="inactiva"></span>';

      var tr = "<tr class='alto50'>";
      tr += "<td class='ancho50'>&nbsp;</td>";
      tr += "<td class='ancho30'>" + (item.id || '') + "</td>";
      tr += "<td class='ancho30'><a seccion='rev' tipo='frm_editrev' data-id='" + (item.id || '') + "' class='editar_rev btn-floating btn-small waves-effect waves-light green' title='Editar revision'><i class='material-icons'>edit</i></a></td>";
      tr += "<td class='ancho200'><span class='main-text'>" + (item.revision || '') + "</span></td>";
      tr += "<td>" + (item.dominio || '') + "</td>";
      tr += "<td class='ancho100'>" + (item.entrada_vigor_dmy || '-') + "</td>";

      tr += "<td class='ancho100'>" + activaBadge + "</td>";
      tr += "<td class='ancho50'>" +
            "<a class='more_rev btn-floating btn-small waves-effect waves-light red' title='Mas' data-id='" + (item.id || '') + "'><i class='material-icons'>more_vert</i></a>" +
            "</td>";
      tr += "</tr>";

      $('#table_revisiones tbody').append(tr);
      totalResultados++;
    });

    $('#resultados_revisiones').html('<span class="main-text">Total de resultados:</span> <span class="secondary-text">' + totalResultados + '</span>');
  }).fail(function(){
    $('#resultados_revisiones').html('Error cargando revisiones');
  });
}

function saveRevision(){
  $('#confirm-message').text('...guardando los cambios...');

  var id       = $('#id_rev').length ? $('#id_rev').val() : '';
  var dominio  = $('#rev_dominio').val() || '';
  var numero   = parseInt($('#rev_numero').val(), 10) || 0;
  var desc     = ($('#rev_descripcion').val() || '').trim();
  var revision = ($('#rev_revision').val() || '').trim();
  var activa   = $('#rev_activa').is(':checked') ? 1 : 0;
  var entrada  = ($('#rev_entrada_vigor').val() || '').trim();

  if (!dominio) {
    modalError('ERROR', 'El campo Dominio es obligatorio.', false, 'Cerrar', 'warning');
    return;
  }
  if (!revision) {
    modalError('ERROR', 'El campo Revisión es obligatorio.', false, 'Cerrar', 'warning');
    return;
  }

  var payload = {
    dominio: dominio,
    numero: numero,
    descripcion: desc,
    revision: revision,
    activa: activa,
    entrada_vigor: entrada
  };

  var apiCall;
  if (typeof id !== 'undefined' && id !== null && String(id).trim() !== '') {
    apiCall = RevisionesAPI.update(id, payload);
  } else {
    apiCall = RevisionesAPI.create(payload);
  }

  apiCall.done(function(resp){
    if ($.trim(resp) === 'OK') {
      $('#modal_confirm').modal('close');
      $('#modal_rev').modal('close');
      $('#filtrar_revisiones').click();
      return;
    }
    modalError('ERROR', 'Error al guardar revision: ' + resp, false, 'Cerrar', 'error');
  }).fail(function(xhr, status, error){
    var msg = (xhr && xhr.responseText) ? (xhr.status + ' ' + (xhr.statusText || '') + ': ' + xhr.responseText) : (status + ' - ' + error);
    modalError('ERROR', 'Error en la peticion al guardar revision. ' + msg, false, 'Cerrar', 'error');
  });
}

var openRevision = function(seccion, cual, id){
  function initModalContent(item){
    var isEdit = !!(item && item.id);
    $('#modal_' + seccion).find('.modal_txt_title').text(isEdit ? ('Editar revisión - ' + (item.revision || '')) : 'Nueva revisión');
    $('#modal_' + seccion).find('.modal_txt_btn_left').html("<i class='material-icons left'>save</i>Guardar");
    $('#modal_' + seccion).find('.modal_txt_btn_right').html("<i class='material-icons left'>exit_to_app</i>Salir");

    $('#modal_' + seccion).find('.contentForm').html(buildRevisionForm(item || {}));

    // Inicializar Materialize select
    var selectElems = document.querySelectorAll('#modal_rev select');
    M.FormSelect.init(selectElems);

    $('#modal_' + seccion).modal({ dismissible: false });
    $('#modal_' + seccion).modal('open');

    if (!isEdit) {
      setTimeout(function(){ $('#rev_revision').focus(); }, 200);
    }
  }

  if (cual === 'frm_editrev') {
    RevisionesAPI.list({ filtro_id: id }).done(function(res){
      if (typeof res === 'string') res = JSON.parse(res);
      var datos = (res && res.resultados) ? res.resultados : [];
      if (datos.length === 0) {
        modalError('ERROR', 'No se encontro la revision', false, 'Cerrar', 'error');
        return;
      }
      initModalContent(datos[0]);
    }).fail(function(){
      modalError('ERROR', 'Error cargando revision', false, 'Cerrar', 'error');
    });

  } else if (cual === 'frm_newrev') {
    initModalContent(null);
  }
};

$(function(){
  if ($('#Revisiones').length) readRevisiones();

  $(document).on('click', '#filtrar_revisiones', function(e){
    e.preventDefault();
    var total = parseInt($('#filtro_revisiones_total').val(), 10) || 0;
    if (total >= 1) {
      readRevisiones();
    } else {
      modalError('ERROR', 'Hay que introducir un numero minimo de resultados esperados!', false);
    }
  });

  $(document).on('click', '#add_revisiones', function(e){
    e.preventDefault();
    window.openModal('rev', 'frm_newrev');
  });

  $(document).on('click', '.editar_rev', function(e){
    e.preventDefault();
    var id = $(this).data('id');
    window.openModal('rev', 'frm_editrev', id);
  });
});

$(document.body).on('click', '#rev_save', function(){
  if ($('#modal_rev').length && $('#modal_rev').is(':visible')) {
    modalConfirm('Guardar revisión', '¿Estas seguro de que quieres guardar los cambios?', false, 'Guardar', 'Cancelar', 'save', 'clear', function(){
      saveRevision();
    }, function(){});
  }
});

jQuery(document).on('keydown', '#Revisiones [id*=filtro_revisiones]', function(e){
  jQuery('#filtrar_revisiones_clear').removeClass('hide');
  if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
    e.preventDefault();
    jQuery(this).closest('#Revisiones').find('#filtrar_revisiones').click();
  }
});

jQuery(document).on('click', '#filtrar_revisiones_clear', function(){
  jQuery(this).addClass('hide');
  var $parent = jQuery(this).closest('#Revisiones');
  $parent.find('#filtro_revisiones_nombre').val('');
  $parent.find('#filtro_revisiones_total').val('15');
  $parent.find('label').not(':eq(0)').removeClass('active');
  $parent.find('#filtrar_revisiones').click();
});

jQuery(document).on('click', '.more_rev', function(e){
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
      'Eliminar revisión',
      '¿Eliminar revisión? Esta accion es irreversible.',
      false,
      'Eliminar',
      'Cancelar',
      'delete_forever',
      'cancel',
      function(){
        RevisionesAPI.remove(itemId)
          .done(function(resp){
            if ($.trim(resp) === 'OK') {
              $('#filtrar_revisiones').click();
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
    jQuery(document).on('click.rowMenuCloseRev', function(ev){
      if (jQuery(ev.target).closest('.row-menu').length === 0 && jQuery(ev.target).closest('.more_rev').length === 0) {
        jQuery('.row-menu').remove();
        jQuery(document).off('click.rowMenuCloseRev');
      }
    });
  }, 10);
});
