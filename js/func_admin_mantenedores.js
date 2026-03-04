// Funciones CRUD para administración de mantenedores (cliente-side)
// Basado en func_admin_campos.js - adaptado a 'mantenedores' (abreviatura 'mant')

var MantsAPI = (function(){
  function request(data){
    return $.ajax({
      url: 'services/mantenedor.php',
      method: 'POST',
      data: data,
      dataType: 'text'
    });
  }

  return {
    list: function(filters){
      filters = filters || {};
      var payload = $.extend({action: 'list', filtro_total: 15}, filters);
      return request(payload);
    },
    create: function(mant){
      var payload = $.extend({action: 'create'}, mant);
      return request(payload);
    },
    update: function(id, mant){
      var payload = $.extend({action: 'update', id: id}, mant);
      return request(payload);
    },
    remove: function(id){
      return request({action: 'delete', id: id});
    }
  };
})();

// Render lista de mantenedores en el contenedor #Mantenedores
function readMantenedores(){
  var total = parseInt($('#filtro_mantenedores_total').val(),10) || 15;
  var nombre = ($('#filtro_mantenedores_nombre').val() || '').trim();
  var filtros = { filtro_total: total };
  if(nombre) filtros.filtro_nombre = nombre;

  $('#table_mantenedores tbody').empty();
  $('#resultados_mantenedores').html('Cargando...');

  MantsAPI.list(filtros).done(function(res){
    if(typeof res === 'string') res = JSON.parse(res);
    var datos = (res && res.resultados) ? res.resultados : [];
    var totalResultados = 0;

    datos.forEach(function(item){
      var id = item.id || '';
      var mantenedor = item.mantenedor || '';
      var corto = item.corto || '';

      var tr = "<tr class='alto50'>";
      tr += "<td class='ancho50'>&nbsp;</td>";
      tr += "<td class='ancho30'>" + id + "</td>";
      tr += "<td class='ancho30'><a seccion='mant' tipo='frm_editmant' data-id='"+id+"' class='editar_mant btn-floating btn-small waves-effect waves-light green' title='Editar mantenedor'><i class='material-icons'>edit</i></a></td>";
      tr += "<td>" + mantenedor + "</td>";
      tr += "<td class='ancho80'><b>" + corto + "</b></td>";
      tr += "<td class='ancho80'>&nbsp;</td>";
      tr += "<td class='ancho50'>" +
            "<a class='more_mant btn-floating btn-small waves-effect waves-light red' title='Más' data-id='"+id+"'><i class='material-icons'>more_vert</i></a>" +
            "</td>";
      tr += "</tr>";

      $('#table_mantenedores tbody').append(tr);
      totalResultados++;
    });

    $('#resultados_mantenedores').html('<span class="main-text">Total de resultados:</span> <span class="secondary-text">' + totalResultados + '</span>');
  }).fail(function(){
    $('#resultados_mantenedores').html('Error cargando mantenedores');
  });
}

// Inicializar la pestaña Mantenedores al cargar la página
$(function(){
  if($('#Mantenedores').length) readMantenedores();

  $(document).on('click', '#filtrar_mantenedores', function(e){
    e.preventDefault();
    var total = parseInt($('#filtro_mantenedores_total').val(), 10) || 0;
    if (total >= 1) {
      readMantenedores();
    } else {
      modalError('ERROR', 'Hay que introducir un número mínimo de resultados esperados!', false);
    }
  });

  $(document).on('click', '#add_mantenedores', function(e){
    e.preventDefault();
    openMant('frm_newmant');
  });

  $(document).on('click', '.editar_mant', function(e){
    e.preventDefault();
    var id = $(this).data('id');
    openMant('frm_editmant', id);
  });
});

// funcion guardar el mantenedor (nuevo/editar)
var saveMant = function() {
  $('#confirm-message').text("...guardando los cambios...");

  var id = $('#id_mant').length ? $('#id_mant').val() : '';
  var mantenedor = ($('#mantenedor_mant').val() || '').trim();
  var corto = ($('#corto_mant').val() || '').trim();

  var mant = {
    mantenedor: mantenedor,
    corto: corto
  };

  var apiCall;
  if (typeof id !== 'undefined' && id !== null && String(id).trim() !== '') {
    apiCall = MantsAPI.update(id, mant);
  } else {
    apiCall = MantsAPI.create(mant);
  }

  apiCall.done(function(data){
    if (typeof data === 'string' && $.trim(data) === 'OK'){
      $('#modal_confirm').modal('close');
      $('#modal_mant').modal('close');
      $('#filtrar_mantenedores').click();
      return;
    }
    var serverMsg = (typeof data === 'string') ? data : JSON.stringify(data);
    modalError('ERROR', 'Error al guardar mantenedor: ' + serverMsg, false, 'Cerrar', 'error', function(){
      $('#modal_mant').modal('close');
    });
  }).fail(function(xhr, status, error){
    var msg = '';
    if(xhr && xhr.responseText){
      msg = xhr.status + ' ' + (xhr.statusText || '') + ': ' + xhr.responseText;
    } else {
      msg = status + ' - ' + error;
    }
    modalError('ERROR', 'Error en la petición al guardar mantenedor. ' + msg, false, 'Cerrar', 'error', function(){
      $('#modal_mant').modal('close');
    });
  });
};

// Click en guardar (botón #mant_save)
$(document.body).on('click', '#mant_save', function(){
  if($('#modal_mant').length && $('#modal_mant').is(':visible')){
    modalConfirm("Guardar mantenedor", "¿Estás seguro de que quieres guardar los cambios?\n\n", false, "Guardar", "Cancelar", "save", "clear", function(){
      saveMant();
    }, function(){
      // cancel
    });
  }
});

var openMant = function(cual, id){
  if(cual === 'frm_editmant'){
    MantsAPI.list({ filtro_id: id }).done(function(res){
      if(typeof res === 'string') res = JSON.parse(res);
      var datos = (res && res.resultados) ? res.resultados : [];
      if(datos.length === 0){
        modalError('ERROR', 'No se encontró el mantenedor', false, 'Cerrar', 'error');
        return;
      }
      var item = datos[0];
      var title = " Editar mantenedor - " + (item.mantenedor || '');
      $("#modal_mant").find(".modal_txt_title").text(title);
      $("#modal_mant").find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
      $("#modal_mant").find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");

      var frm = '<form id="mantenedor_frm_editar">' +
        '<div class="row">' +
          '<div class="input-field anchoFrm4 left">' +
            '<input type="text" id="mantenedor_mant" name="mantenedor" value="'+ (item.mantenedor || '') +'" autocomplete="off">' +
            '<label for="mantenedor_mant" class="active">Mantenedor</label>' +
          '</div>' +
          '<div class="input-field anchoFrm4 inline">' +
            '<input type="text" id="corto_mant" name="corto" value="'+ (item.corto || '') +'" autocomplete="off">' +
            '<label for="corto_mant" class="active">Corto</label>' +
          '</div>' +
        '</div>' +
        '<div class="input-field" style="display:none;">' +
          '<input type="text" id="id_mant" name="id" value="'+ (item.id || '') +'">' +
        '</div>' +
      '</form>';

      $("#modal_mant").find(".contentForm").html(frm);
      $("#modal_mant").modal({ dismissible: false });
      $("#modal_mant").modal('open');
    }).fail(function(){
      modalError('ERROR','Error cargando mantenedor',false,'Cerrar','error');
    });
  } else if(cual === 'frm_newmant'){
    var title = 'Nuevo mantenedor';
    $("#modal_mant").find(".modal_txt_title").text(title);
    $("#modal_mant").find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
    $("#modal_mant").find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");

    var frm = '<form id="mantenedor_frm_nuevo">' +
      '<div class="row">' +
        '<div class="input-field anchoFrm4 left">' +
          '<input type="text" id="mantenedor_mant" name="mantenedor" value="" autocomplete="off">' +
          '<label for="mantenedor_mant">Mantenedor</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="text" id="corto_mant" name="corto" value="" autocomplete="off">' +
          '<label for="corto_mant">Corto</label>' +
        '</div>' +
      '</div>' +
    '</form>';

    $("#modal_mant").find(".contentForm").html(frm);
    $("#modal_mant").modal({ dismissible: false });
    $("#modal_mant").modal('open');
    setTimeout(function(){ $('#mantenedor_mant').focus(); }, 200);
  }
};

// Menú contextual para cada fila de mantenedores (ocultar fila / eliminar)
jQuery(document).on('click', '.more_mant', function(e){
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
        var $tr = $btn.closest('tr');
        $tr.addClass('hidden-row');
        menu.remove();
    });

    menu.on('click', '.row-menu-delete', function(ev){
        ev.stopPropagation();
        modalConfirm(
          "Eliminar mantenedor",
          "¿Eliminar mantenedor? Esta acción es irreversible.",
          false,
          "Eliminar",
          "Cancelar",
          "delete_forever",
          "cancel",
          function(){
            MantsAPI.remove(itemId)
              .done(function(resp){
                if($.trim(resp) === 'OK'){
                  $('#filtrar_mantenedores').click();
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
      jQuery(document).on('click.rowMenuCloseMant', function(ev){
        if(jQuery(ev.target).closest('.row-menu').length===0 && jQuery(ev.target).closest('.more_mant').length===0){
          jQuery('.row-menu').remove();
          jQuery(document).off('click.rowMenuCloseMant');
        }
      });
    }, 10);
});

  // Permitir pulsar Enter en los campos de filtro para ejecutar la búsqueda
  jQuery(document).on('keydown', '#Mantenedores [id*=filtro_mantenedores]', function(e){
    jQuery('#filtrar_mantenedores_clear').removeClass('hide');
    if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
      e.preventDefault();
      jQuery(this).closest('#Mantenedores').find('#filtrar_mantenedores').click();
    }
  });

  // Limpiar filtros de mantenedores
  jQuery(document).on('click', '#filtrar_mantenedores_clear', function() {
    jQuery(this).addClass('hide');
    var $parent = jQuery(this).closest('#Mantenedores');
    $parent.find('#filtro_mantenedores_nombre').val('');
    $parent.find('#filtro_mantenedores_total').val('15');
    $parent.find('label').not(':eq(0)').removeClass('active');
    $parent.find('#filtrar_mantenedores').click();
  });
