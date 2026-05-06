// Funciones CRUD para administracion de legislacion

var LegislacionAPI = (function(){
  function request(data){
    return $.ajax({
      url: 'services/legislacion.php',
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

var LEGISLACION_OPTIONS = [
  'RAE 1966',
  'RD 2291/1985 (ITC-MIE-AEM1)',
  'R.D. 1314/1997',
  'R.D. 203/2016'
];

function buildLegislacionOptions(selectedValue){
  var html = '<option value="" disabled' + (!selectedValue ? ' selected' : '') + '>Selecciona legislación</option>';
  LEGISLACION_OPTIONS.forEach(function(option){
    html += '<option value="' + option + '"' + (option === selectedValue ? ' selected' : '') + '>' + option + '</option>';
  });
  return html;
}

function readLegislacion(){
  var total = parseInt($('#filtro_legislacion_total').val(), 10) || 15;
  var nombre = ($('#filtro_legislacion_nombre').val() || '').trim();

  var filtros = { filtro_total: total };
  if (nombre) filtros.filtro_nombre = nombre;

  $('#table_legislacion tbody').empty();
  $('#resultados_legislacion').html('Cargando...');

  LegislacionAPI.list(filtros).done(function(res){
    if (typeof res === 'string') res = JSON.parse(res);
    var datos = (res && res.resultados) ? res.resultados : [];
    var totalResultados = 0;

    datos.forEach(function(item){
      var estadoBadge = (item.activa == 1)
        ? '<span class="new badge green" data-badge-caption="activa"></span>'
        : '<span class="new badge grey" data-badge-caption="inactiva"></span>';

      var tr = "<tr class='alto50'>";
      tr += "<td class='ancho50'>&nbsp;</td>";
      tr += "<td class='ancho30'>" + (item.id || '') + "</td>";
      tr += "<td class='ancho30'><a seccion='leg' tipo='frm_editleg' data-id='" + (item.id || '') + "' class='editar_leg btn-floating btn-small waves-effect waves-light green' title='Editar legislacion'><i class='material-icons'>edit</i></a></td>";
      tr += "<td>" + (item.nombre || '') + "</td>";
      tr += "<td class='ancho200'>" + (item.legislacion || '') + "</td>";
      tr += "<td class='ancho150'>" + (item.abrev || '') + "</td>";
      tr += "<td class='ancho100'>" + estadoBadge + "</td>";
      tr += "<td class='ancho50'>" +
            "<a class='more_leg btn-floating btn-small waves-effect waves-light red' title='Mas' data-id='" + (item.id || '') + "'><i class='material-icons'>more_vert</i></a>" +
            "</td>";
      tr += "</tr>";

      $('#table_legislacion tbody').append(tr);
      totalResultados++;
    });

    $('#resultados_legislacion').html('<span class="main-text">Total de resultados:</span> <span class="secondary-text">' + totalResultados + '</span>');
  }).fail(function(){
    $('#resultados_legislacion').html('Error cargando legislacion');
  });
}

function saveLegislacion(){
  $('#confirm-message').text('...guardando los cambios...');

  var id = $('#id_leg').length ? $('#id_leg').val() : '';
  var nombre = ($('#leg_nombre').val() || '').trim();
  var legislacion = ($('#leg_legislacion').val() || '').trim();
  var abrev = ($('#leg_abrev').val() || '').trim();
  var activa = $('#leg_activa').is(':checked') ? 1 : 0;

  if (!nombre || !abrev || !legislacion) {
    modalError('ERROR', 'Nombre, Legislación y Abreviatura son obligatorios.', false, 'Cerrar', 'warning');
    return;
  }

  var payload = { nombre: nombre, legislacion: legislacion, abrev: abrev, activa: activa };

  var apiCall;
  if (typeof id !== 'undefined' && id !== null && String(id).trim() !== '') {
    apiCall = LegislacionAPI.update(id, payload);
  } else {
    apiCall = LegislacionAPI.create(payload);
  }

  apiCall.done(function(resp){
    if ($.trim(resp) === 'OK') {
      $('#modal_confirm').modal('close');
      $('#modal_leg').modal('close');
      $('#filtrar_legislacion').click();
      return;
    }
    modalError('ERROR', 'Error al guardar legislacion: ' + resp, false, 'Cerrar', 'error');
  }).fail(function(xhr, status, error){
    var msg = (xhr && xhr.responseText) ? (xhr.status + ' ' + (xhr.statusText || '') + ': ' + xhr.responseText) : (status + ' - ' + error);
    modalError('ERROR', 'Error en la peticion al guardar legislacion. ' + msg, false, 'Cerrar', 'error');
  });
}

var openLegislacion = function(seccion, cual, id){
  if (cual === 'frm_editleg') {
    LegislacionAPI.list({ filtro_id: id }).done(function(res){
      if (typeof res === 'string') res = JSON.parse(res);
      var datos = (res && res.resultados) ? res.resultados : [];
      if (datos.length === 0) {
        modalError('ERROR', 'No se encontro la legislacion', false, 'Cerrar', 'error');
        return;
      }

      var item = datos[0];
      $('#modal_' + seccion).find('.modal_txt_title').text('Editar legislacion - ' + (item.nombre || ''));
      $('#modal_' + seccion).find('.modal_txt_btn_left').html("<i class='material-icons left'>save</i>Guardar");
      $('#modal_' + seccion).find('.modal_txt_btn_right').html("<i class='material-icons left'>exit_to_app</i>Salir");

      var activaChecked = (item.activa == 1) ? 'checked' : '';
      var frm = '' +
        '<form id="legislacion_frm_editar">' +
          '<div class="input-field">' +
            '<input type="text" id="leg_nombre" value="' + (item.nombre || '') + '" autocomplete="off">' +
            '<label for="leg_nombre" class="active">Nombre</label>' +
          '</div>' +
          '<div class="input-field">' +
            '<select id="leg_legislacion">' +
              buildLegislacionOptions(item.legislacion || '') +
            '</select>' +
            '<label class="active">Legislación</label>' +
          '</div>' +
          '<div class="input-field">' +
            '<input type="text" id="leg_abrev" value="' + (item.abrev || '') + '" autocomplete="off">' +
            '<label for="leg_abrev" class="active">Abreviatura</label>' +
          '</div>' +
          '<p>' +
            '<label>' +
              '<input type="checkbox" id="leg_activa" value="1" ' + activaChecked + '>' +
              '<span>Activa</span>' +
            '</label>' +
          '</p>' +
          '<div class="input-field" style="display:none;">' +
            '<input type="text" id="id_leg" value="' + (item.id || '') + '">' +
          '</div>' +
        '</form>';

      $('#modal_' + seccion).find('.contentForm').html(frm);
  $('#modal_' + seccion).find('select').formSelect();
      $('#modal_' + seccion).modal({ dismissible: false });
      $('#modal_' + seccion).modal('open');
    }).fail(function(){
      modalError('ERROR', 'Error cargando legislacion', false, 'Cerrar', 'error');
    });

  } else if (cual === 'frm_newleg') {
    $('#modal_' + seccion).find('.modal_txt_title').text('Nueva legislacion');
    $('#modal_' + seccion).find('.modal_txt_btn_left').html("<i class='material-icons left'>save</i>Guardar");
    $('#modal_' + seccion).find('.modal_txt_btn_right').html("<i class='material-icons left'>exit_to_app</i>Salir");

    var frmNew = '' +
      '<form id="legislacion_frm_nuevo">' +
        '<div class="input-field">' +
          '<input type="text" id="leg_nombre" value="" autocomplete="off">' +
          '<label for="leg_nombre">Nombre</label>' +
        '</div>' +
        '<div class="input-field">' +
          '<select id="leg_legislacion">' +
            buildLegislacionOptions('') +
          '</select>' +
          '<label>Legislación</label>' +
        '</div>' +
        '<div class="input-field">' +
          '<input type="text" id="leg_abrev" value="" autocomplete="off">' +
          '<label for="leg_abrev">Abreviatura</label>' +
        '</div>' +
        '<p>' +
          '<label>' +
            '<input type="checkbox" id="leg_activa" value="1" checked>' +
            '<span>Activa</span>' +
          '</label>' +
        '</p>' +
      '</form>';

    $('#modal_' + seccion).find('.contentForm').html(frmNew);
    $('#modal_' + seccion).find('select').formSelect();
    $('#modal_' + seccion).modal({ dismissible: false });
    $('#modal_' + seccion).modal('open');
    setTimeout(function(){ $('#leg_nombre').focus(); }, 200);
  }
};

$(function(){
  if ($('#Legislacion').length) readLegislacion();

  $(document).on('click', '#filtrar_legislacion', function(e){
    e.preventDefault();
    var total = parseInt($('#filtro_legislacion_total').val(), 10) || 0;
    if (total >= 1) {
      readLegislacion();
    } else {
      modalError('ERROR', 'Hay que introducir un numero minimo de resultados esperados!', false);
    }
  });

  $(document).on('click', '#add_legislacion', function(e){
    e.preventDefault();
    window.openModal('leg', 'frm_newleg');
  });

  $(document).on('click', '.editar_leg', function(e){
    e.preventDefault();
    var id = $(this).data('id');
    window.openModal('leg', 'frm_editleg', id);
  });
});

$(document.body).on('click', '#leg_save', function(){
  if ($('#modal_leg').length && $('#modal_leg').is(':visible')) {
    modalConfirm('Guardar legislacion', '¿Estas seguro de que quieres guardar los cambios?', false, 'Guardar', 'Cancelar', 'save', 'clear', function(){
      saveLegislacion();
    }, function(){});
  }
});

jQuery(document).on('keydown', '#Legislacion [id*=filtro_legislacion]', function(e){
  jQuery('#filtrar_legislacion_clear').removeClass('hide');
  if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
    e.preventDefault();
    jQuery(this).closest('#Legislacion').find('#filtrar_legislacion').click();
  }
});

jQuery(document).on('click', '#filtrar_legislacion_clear', function(){
  jQuery(this).addClass('hide');
  var $parent = jQuery(this).closest('#Legislacion');
  $parent.find('#filtro_legislacion_nombre').val('');
  $parent.find('#filtro_legislacion_total').val('15');
  $parent.find('label').not(':eq(0)').removeClass('active');
  $parent.find('#filtrar_legislacion').click();
});

jQuery(document).on('click', '.more_leg', function(e){
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
      'Eliminar legislacion',
      '¿Eliminar legislacion? Esta accion es irreversible.',
      false,
      'Eliminar',
      'Cancelar',
      'delete_forever',
      'cancel',
      function(){
        LegislacionAPI.remove(itemId)
          .done(function(resp){
            if ($.trim(resp) === 'OK') {
              $('#filtrar_legislacion').click();
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
    jQuery(document).on('click.rowMenuCloseLeg', function(ev){
      if (jQuery(ev.target).closest('.row-menu').length === 0 && jQuery(ev.target).closest('.more_leg').length === 0) {
        jQuery('.row-menu').remove();
        jQuery(document).off('click.rowMenuCloseLeg');
      }
    });
  }, 10);
});
