// Funciones CRUD para administracion de historial de versiones

var HistorialAPI = (function(){
  function request(data){
    return $.ajax({
      url: 'services/historial.php',
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

function readHistorial(){
  var total   = parseInt($('#filtro_historial_total').val(), 10) || 15;
  var version = ($('#filtro_historial_version').val() || '').trim();

  var filtros = { filtro_total: total };
  if (version) filtros.filtro_version = version;

  $('#table_historial tbody').empty();
  $('#resultados_historial').html('Cargando...');

  HistorialAPI.list(filtros).done(function(res){
    if (typeof res === 'string') res = JSON.parse(res);
    var datos = (res && res.resultados) ? res.resultados : [];
    var totalResultados = 0;

    datos.forEach(function(item){
      var tr = "<tr class='alto50'>";
      tr += "<td class='ancho50'>&nbsp;</td>";
      tr += "<td class='ancho30'>" + (item.id || '') + "</td>";
      tr += "<td class='ancho30'><a seccion='his' tipo='frm_edithis' data-id='" + (item.id || '') + "' class='editar_his btn-floating btn-small waves-effect waves-light green' title='Editar version'><i class='material-icons'>edit</i></a></td>";
      tr += "<td><span class='main-text'>" + (item.version || '') + "</span></td>";
      tr += "<td class='ancho150'>" + (item.date_dmy || '-') + "</td>";
      tr += "<td class='ancho50'>" +
            "<a class='more_his btn-floating btn-small waves-effect waves-light red' title='Mas' data-id='" + (item.id || '') + "'><i class='material-icons'>more_vert</i></a>" +
            "</td>";
      tr += "</tr>";

      $('#table_historial tbody').append(tr);
      totalResultados++;
    });

    $('#resultados_historial').html('<span class="main-text">Total de resultados:</span> <span class="secondary-text">' + totalResultados + '</span>');
  }).fail(function(){
    $('#resultados_historial').html('Error cargando historial');
  });
}

function saveHistorial(){
  $('#confirm-message').text('...guardando los cambios...');

  var id      = $('#id_his').length ? $('#id_his').val() : '';
  var version = ($('#his_version').val() || '').trim();
  var texto   = ($('#his_texto').val() || '').trim();
  var date    = ($('#his_date').val() || '').trim();

  if (!version) {
    modalError('ERROR', 'El campo Versión es obligatorio.', false, 'Cerrar', 'warning');
    return;
  }

  var payload = {
    version: version,
    texto: texto,
    date: date
  };

  var apiCall;
  if (typeof id !== 'undefined' && id !== null && String(id).trim() !== '') {
    apiCall = HistorialAPI.update(id, payload);
  } else {
    apiCall = HistorialAPI.create(payload);
  }

  apiCall.done(function(resp){
    if ($.trim(resp) === 'OK') {
      $('#modal_confirm').modal('close');
      $('#modal_his').modal('close');
      $('#filtrar_historial').click();
      return;
    }
    modalError('ERROR', 'Error al guardar version: ' + resp, false, 'Cerrar', 'error');
  }).fail(function(xhr, status, error){
    var msg = (xhr && xhr.responseText) ? (xhr.status + ' ' + (xhr.statusText || '') + ': ' + xhr.responseText) : (status + ' - ' + error);
    modalError('ERROR', 'Error en la peticion al guardar version. ' + msg, false, 'Cerrar', 'error');
  });
}

var openHistorial = function(seccion, cual, id){
  if (cual === 'frm_edithis') {
    HistorialAPI.list({ filtro_id: id }).done(function(res){
      if (typeof res === 'string') res = JSON.parse(res);
      var datos = (res && res.resultados) ? res.resultados : [];
      if (datos.length === 0) {
        modalError('ERROR', 'No se encontro la version', false, 'Cerrar', 'error');
        return;
      }

      var item = datos[0];
      $('#modal_' + seccion).find('.modal_txt_title').text('Editar versión - ' + (item.version || ''));
      $('#modal_' + seccion).find('.modal_txt_btn_left').html("<i class='material-icons left'>save</i>Guardar");
      $('#modal_' + seccion).find('.modal_txt_btn_right').html("<i class='material-icons left'>exit_to_app</i>Salir");

      var frm = '' +
        '<form id="historial_frm_editar">' +
          '<div class="input-field">' +
            '<input type="text" id="his_version" value="' + (item.version || '') + '" autocomplete="off">' +
            '<label for="his_version" class="active">Versión</label>' +
          '</div>' +
          '<div class="input-field">' +
            '<textarea id="his_texto" style="height: 5.5em; min-height: 5.5em; max-height: 5.5em; resize: none; overflow-y: auto;">' + (item.texto || '') + '</textarea>' +
            '<label for="his_texto" class="active">Texto</label>' +
          '</div>' +
          '<div class="input-field">' +
            '<input type="date" id="his_date" value="' + (item.date || '') + '">' +
            '<label for="his_date" class="active">Fecha</label>' +
          '</div>' +
          '<div class="input-field" style="display:none;">' +
            '<input type="text" id="id_his" value="' + (item.id || '') + '">' +
          '</div>' +
        '</form>';

      $('#modal_' + seccion).find('.contentForm').html(frm);
      $('#modal_' + seccion).modal({ dismissible: false });
      $('#modal_' + seccion).modal('open');
    }).fail(function(){
      modalError('ERROR', 'Error cargando version', false, 'Cerrar', 'error');
    });

  } else if (cual === 'frm_newhis') {
    $('#modal_' + seccion).find('.modal_txt_title').text('Nueva versión');
    $('#modal_' + seccion).find('.modal_txt_btn_left').html("<i class='material-icons left'>save</i>Guardar");
    $('#modal_' + seccion).find('.modal_txt_btn_right').html("<i class='material-icons left'>exit_to_app</i>Salir");

    var frmNew = '' +
      '<form id="historial_frm_nuevo">' +
        '<div class="input-field">' +
          '<input type="text" id="his_version" value="" autocomplete="off">' +
          '<label for="his_version">Versión</label>' +
        '</div>' +
        '<div class="input-field">' +
          '<textarea id="his_texto" style="height: 5.5em; min-height: 5.5em; max-height: 5.5em; resize: none; overflow-y: auto;"></textarea>' +
          '<label for="his_texto">Texto</label>' +
        '</div>' +
        '<div class="input-field">' +
          '<input type="date" id="his_date" value="">' +
          '<label for="his_date">Fecha</label>' +
        '</div>' +
      '</form>';

    $('#modal_' + seccion).find('.contentForm').html(frmNew);
    $('#modal_' + seccion).modal({ dismissible: false });
    $('#modal_' + seccion).modal('open');
    setTimeout(function(){ $('#his_version').focus(); }, 200);
  }
};

$(function(){
  if ($('#Historial').length) readHistorial();

  $(document).on('click', '#filtrar_historial', function(e){
    e.preventDefault();
    var total = parseInt($('#filtro_historial_total').val(), 10) || 0;
    if (total >= 1) {
      readHistorial();
    } else {
      modalError('ERROR', 'Hay que introducir un numero minimo de resultados esperados!', false);
    }
  });

  $(document).on('click', '#add_historial', function(e){
    e.preventDefault();
    window.openModal('his', 'frm_newhis');
  });

  $(document).on('click', '.editar_his', function(e){
    e.preventDefault();
    var id = $(this).data('id');
    window.openModal('his', 'frm_edithis', id);
  });
});

$(document.body).on('click', '#his_save', function(){
  if ($('#modal_his').length && $('#modal_his').is(':visible')) {
    modalConfirm('Guardar versión', '¿Estas seguro de que quieres guardar los cambios?', false, 'Guardar', 'Cancelar', 'save', 'clear', function(){
      saveHistorial();
    }, function(){});
  }
});

jQuery(document).on('keydown', '#Historial [id*=filtro_historial]', function(e){
  jQuery('#filtrar_historial_clear').removeClass('hide');
  if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
    e.preventDefault();
    jQuery(this).closest('#Historial').find('#filtrar_historial').click();
  }
});

jQuery(document).on('click', '#filtrar_historial_clear', function(){
  jQuery(this).addClass('hide');
  var $parent = jQuery(this).closest('#Historial');
  $parent.find('#filtro_historial_version').val('');
  $parent.find('#filtro_historial_total').val('15');
  $parent.find('label').not(':eq(0)').removeClass('active');
  $parent.find('#filtrar_historial').click();
});

jQuery(document).on('click', '.more_his', function(e){
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
      'Eliminar versión',
      '¿Eliminar versión? Esta accion es irreversible.',
      false,
      'Eliminar',
      'Cancelar',
      'delete_forever',
      'cancel',
      function(){
        HistorialAPI.remove(itemId)
          .done(function(resp){
            if ($.trim(resp) === 'OK') {
              $('#filtrar_historial').click();
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
    jQuery(document).on('click.rowMenuCloseHis', function(ev){
      if (jQuery(ev.target).closest('.row-menu').length === 0 && jQuery(ev.target).closest('.more_his').length === 0) {
        jQuery('.row-menu').remove();
        jQuery(document).off('click.rowMenuCloseHis');
      }
    });
  }, 10);
});
