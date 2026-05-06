// Funciones CRUD para administracion de tarifas

var TarifasAPI = (function(){
  function request(data){
    return $.ajax({
      url: 'services/tarifas.php',
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

function readTarifas(){
  var total = parseInt($('#filtro_tarifas_total').val(), 10) || 15;
  var tarifa = ($('#filtro_tarifas_tarifa').val() || '').trim();

  var filtros = { filtro_total: total };
  if (tarifa) filtros.filtro_tarifa = tarifa;

  $('#table_tarifas tbody').empty();
  $('#resultados_tarifas').html('Cargando...');

  TarifasAPI.list(filtros).done(function(res){
    if (typeof res === 'string') res = JSON.parse(res);
    var datos = (res && res.resultados) ? res.resultados : [];
    var totalResultados = 0;

    datos.forEach(function(item){
      var tr = "<tr class='alto50'>";
      tr += "<td class='ancho50'>&nbsp;</td>";
      tr += "<td class='ancho30'>" + (item.id || '') + "</td>";
      tr += "<td class='ancho30'><a seccion='tar' tipo='frm_edittar' data-id='" + (item.id || '') + "' class='editar_tar btn-floating btn-small waves-effect waves-light green' title='Editar tarifa'><i class='material-icons'>edit</i></a></td>";
      tr += "<td><span class='main-text'>" + (item.tarifa || '') + "</span></td>";
      tr += "<td class='ancho100'>" + (item.precio !== undefined ? item.precio : '') + " €</td>";
      tr += "<td class='ancho100'>&nbsp;</td>";
      tr += "<td class='ancho50'>" +
            "<a class='more_tar btn-floating btn-small waves-effect waves-light red' title='Mas' data-id='" + (item.id || '') + "'><i class='material-icons'>more_vert</i></a>" +
            "</td>";
      tr += "</tr>";

      $('#table_tarifas tbody').append(tr);
      totalResultados++;
    });

    $('#resultados_tarifas').html('<span class="main-text">Total de resultados:</span> <span class="secondary-text">' + totalResultados + '</span>');
  }).fail(function(){
    $('#resultados_tarifas').html('Error cargando tarifas');
  });
}

function saveTarifa(){
  $('#confirm-message').text('...guardando los cambios...');

  var id = $('#id_tar').length ? $('#id_tar').val() : '';
  var tarifa = ($('#tarifa_tar').val() || '').trim();
  var precio = parseInt($('#precio_tar').val(), 10) || 0;

  if (!tarifa) {
    modalError('ERROR', 'El campo Tarifa es obligatorio.', false, 'Cerrar', 'warning');
    return;
  }

  var payload = { tarifa: tarifa, precio: precio };

  var apiCall;
  if (typeof id !== 'undefined' && id !== null && String(id).trim() !== '') {
    apiCall = TarifasAPI.update(id, payload);
  } else {
    apiCall = TarifasAPI.create(payload);
  }

  apiCall.done(function(resp){
    if ($.trim(resp) === 'OK') {
      $('#modal_confirm').modal('close');
      $('#modal_tar').modal('close');
      $('#filtrar_tarifas').click();
      return;
    }
    modalError('ERROR', 'Error al guardar tarifa: ' + resp, false, 'Cerrar', 'error');
  }).fail(function(xhr, status, error){
    var msg = (xhr && xhr.responseText) ? (xhr.status + ' ' + (xhr.statusText || '') + ': ' + xhr.responseText) : (status + ' - ' + error);
    modalError('ERROR', 'Error en la peticion al guardar tarifa. ' + msg, false, 'Cerrar', 'error');
  });
}

var openTarifa = function(seccion, cual, id){
  if (cual === 'frm_edittar') {
    TarifasAPI.list({ filtro_id: id }).done(function(res){
      if (typeof res === 'string') res = JSON.parse(res);
      var datos = (res && res.resultados) ? res.resultados : [];
      if (datos.length === 0) {
        modalError('ERROR', 'No se encontro la tarifa', false, 'Cerrar', 'error');
        return;
      }

      var item = datos[0];
      $('#modal_' + seccion).find('.modal_txt_title').text('Editar tarifa - ' + (item.tarifa || ''));
      $('#modal_' + seccion).find('.modal_txt_btn_left').html("<i class='material-icons left'>save</i>Guardar");
      $('#modal_' + seccion).find('.modal_txt_btn_right').html("<i class='material-icons left'>exit_to_app</i>Salir");

      var frm = '' +
        '<form id="tarifa_frm_editar">' +
          '<div class="input-field">' +
            '<input type="text" id="tarifa_tar" value="' + (item.tarifa || '') + '" autocomplete="off">' +
            '<label for="tarifa_tar" class="active">Tarifa</label>' +
          '</div>' +
          '<div class="input-field anchoFrm4">' +
            '<input type="number" id="precio_tar" value="' + (item.precio !== undefined ? item.precio : '') + '" autocomplete="off">' +
            '<label for="precio_tar" class="active">Precio (€)</label>' +
          '</div>' +
          '<div class="input-field" style="display:none;">' +
            '<input type="text" id="id_tar" value="' + (item.id || '') + '">' +
          '</div>' +
        '</form>';

      $('#modal_' + seccion).find('.contentForm').html(frm);
      $('#modal_' + seccion).modal({ dismissible: false });
      $('#modal_' + seccion).modal('open');
    }).fail(function(){
      modalError('ERROR', 'Error cargando tarifa', false, 'Cerrar', 'error');
    });

  } else if (cual === 'frm_newtar') {
    $('#modal_' + seccion).find('.modal_txt_title').text('Nueva tarifa');
    $('#modal_' + seccion).find('.modal_txt_btn_left').html("<i class='material-icons left'>save</i>Guardar");
    $('#modal_' + seccion).find('.modal_txt_btn_right').html("<i class='material-icons left'>exit_to_app</i>Salir");

    var frmNew = '' +
      '<form id="tarifa_frm_nuevo">' +
        '<div class="input-field">' +
          '<input type="text" id="tarifa_tar" value="" autocomplete="off">' +
          '<label for="tarifa_tar">Tarifa</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4">' +
          '<input type="number" id="precio_tar" value="" autocomplete="off">' +
          '<label for="precio_tar">Precio (€)</label>' +
        '</div>' +
      '</form>';

    $('#modal_' + seccion).find('.contentForm').html(frmNew);
    $('#modal_' + seccion).modal({ dismissible: false });
    $('#modal_' + seccion).modal('open');
    setTimeout(function(){ $('#tarifa_tar').focus(); }, 200);
  }
};

$(function(){
  if ($('#Tarifas').length) readTarifas();

  $(document).on('click', '#filtrar_tarifas', function(e){
    e.preventDefault();
    var total = parseInt($('#filtro_tarifas_total').val(), 10) || 0;
    if (total >= 1) {
      readTarifas();
    } else {
      modalError('ERROR', 'Hay que introducir un numero minimo de resultados esperados!', false);
    }
  });

  $(document).on('click', '#add_tarifas', function(e){
    e.preventDefault();
    window.openModal('tar', 'frm_newtar');
  });

  $(document).on('click', '.editar_tar', function(e){
    e.preventDefault();
    var id = $(this).data('id');
    window.openModal('tar', 'frm_edittar', id);
  });
});

$(document.body).on('click', '#tar_save', function(){
  if ($('#modal_tar').length && $('#modal_tar').is(':visible')) {
    modalConfirm('Guardar tarifa', '¿Estas seguro de que quieres guardar los cambios?', false, 'Guardar', 'Cancelar', 'save', 'clear', function(){
      saveTarifa();
    }, function(){});
  }
});

jQuery(document).on('keydown', '#Tarifas [id*=filtro_tarifas]', function(e){
  jQuery('#filtrar_tarifas_clear').removeClass('hide');
  if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
    e.preventDefault();
    jQuery(this).closest('#Tarifas').find('#filtrar_tarifas').click();
  }
});

jQuery(document).on('click', '#filtrar_tarifas_clear', function(){
  jQuery(this).addClass('hide');
  var $parent = jQuery(this).closest('#Tarifas');
  $parent.find('#filtro_tarifas_tarifa').val('');
  $parent.find('#filtro_tarifas_total').val('15');
  $parent.find('label').not(':eq(0)').removeClass('active');
  $parent.find('#filtrar_tarifas').click();
});

jQuery(document).on('click', '.more_tar', function(e){
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
      'Eliminar tarifa',
      '¿Eliminar tarifa? Esta accion es irreversible.',
      false,
      'Eliminar',
      'Cancelar',
      'delete_forever',
      'cancel',
      function(){
        TarifasAPI.remove(itemId)
          .done(function(resp){
            if ($.trim(resp) === 'OK') {
              $('#filtrar_tarifas').click();
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
    jQuery(document).on('click.rowMenuCloseTar', function(ev){
      if (jQuery(ev.target).closest('.row-menu').length === 0 && jQuery(ev.target).closest('.more_tar').length === 0) {
        jQuery('.row-menu').remove();
        jQuery(document).off('click.rowMenuCloseTar');
      }
    });
  }, 10);
});
