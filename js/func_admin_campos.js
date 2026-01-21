// Funciones CRUD para administración de campos (cliente-side)
// Basado en func_admin_equipos.js - adaptado a 'campos'

var CamposAPI = (function(){
  function request(data){
    return $.ajax({
      url: 'services/campos.php',
      method: 'POST',
      data: data,
      dataType: 'json'
    });
  }

  return {
    list: function(filters){
      filters = filters || {};
      var payload = $.extend({action: 'list', filtro_total: 15}, filters);
      return request(payload);
    },
    create: function(campo){
      var payload = $.extend({action: 'create'}, campo);
      return request(payload);
    },
    update: function(id, campo){
      var payload = $.extend({action: 'update', id: id}, campo);
      return request(payload);
    },
    remove: function(id){
      return request({action: 'delete', id: id});
    }
  };
})();

// Render lista de campos en el contenedor #Campos
function readCampos(){
  var total = parseInt($('#filtro_campos_total').val(),10) || 15;
  var nombre = ($('#filtro_campos_nombre').val() || '').trim();
  var filtros = { filtro_total: total };
  if(nombre) filtros.filtro_nombre = nombre;

  $('#table_campos tbody').empty();
  $('#resultados_campos').html('Cargando...');

  CamposAPI.list(filtros).done(function(res){
    var datos = (res && res.resultados) ? res.resultados : [];
    var totalResultados = 0;

    datos.forEach(function(item){
      var id = item.id || '';
      var nombre_revision = item.revision_nombre || '';
      var tipo = item.tipo || '';
      var nombreCp = item.nombre || '';
      var abrev = item.abrev || '';
      var unidad = item.unidad || '';

      var tr = "<tr class='alto50'>";
      tr += "<td class='ancho50'>&nbsp;</td>";
      tr += "<td class='ancho30'>" + id + "</td>";
      tr += "<td class='ancho80'>" + tipo + "</td>";
      tr += "<td class='ancho30'><a seccion='camp' tipo='frm_editcamp' data-id='"+id+"' class='editar_camp btn-floating btn-small waves-effect waves-light green' title='Editar campo'><i class='material-icons'>edit</i></a></td>";
      tr += "<td class='ancho80'>" + nombreCp + "</td>";
      tr += "<td class='ancho200'><b>" + abrev + "</b></td>";
      tr += "<td class='ancho80'>" + unidad + "</td>";
      tr += "<td class='ancho80'>" + nombre_revision + "</td>";
      tr += "<td class='ancho50'>" +
            "<a class='more_camp btn-floating btn-small waves-effect waves-light red' title='Más' data-id='"+id+"'><i class='material-icons'>more_vert</i></a>" +
            "</td>";
      tr += "</tr>";

      $('#table_campos tbody').append(tr);
      totalResultados++;
    });

    $('#resultados_campos').html('<span class="main-text">Total de resultados:</span> <span class="secondary-text">' + totalResultados + '</span>');
  }).fail(function(){
    $('#resultados_campos').html('Error cargando campos');
  });
}

// Inicializar la pestaña Campos al cargar la página
$(function(){
  if($('#Campos').length) readCampos();

  $(document).on('click', '#filtrar_campos', function(e){
    e.preventDefault();
    var total = parseInt($('#filtro_campos_total').val(), 10) || 0;
    if (total >= 1) {
      readCampos();
    } else {
      modalError('ERROR', 'Hay que introducir un número mínimo de resultados esperados! Introduce un valor en registros.', false);
    }
  });

  $(document).on('click', '#add_campos', function(e){
    e.preventDefault();
    window.openModal('camp', 'frm_newcamp');
  });

  $(document).on('click', '.editar_camp', function(e){
    e.preventDefault();
    var id = $(this).data('id');
    window.openModal('camp', 'frm_editcamp', id);
  });
});

// funcion guardar el campo (nuevo/editar)
var saveCampo = function() {
  $('#confirm-message').text("...guardando los cambios...");

  var id = $('#id_camp').length ? $('#id_camp').val() : '';
  var id_revision = ($('#id_revision_camp').val() || '').trim();
  var tipo = ($('#tipo_camp').val() || '').trim();
  var nombre = ($('#nombre_camp').val() || '').trim();
  var abrev = ($('#abrev_camp').val() || '').trim();
  var unidad = ($('#unidad_camp').val() || '').trim();

  var campo = {
    id_revision: id_revision,
    tipo: tipo,
    nombre: nombre,
    abrev: abrev,
    unidad: unidad
  };

  var apiCall;
  if (typeof id !== 'undefined' && id !== null && String(id).trim() !== '') {
    // Editar campo existente
    apiCall = CamposAPI.update(id, campo);
  } else {
    // Crear nuevo campo
    apiCall = CamposAPI.create(campo);
  }

  apiCall.done(function(data){
    if (typeof data === 'string' && data.trim() === 'OK'){
      $('#modal_confirm').modal('close');
      $('#modal_camp').modal('close');
      $('#filtrar_campos').click();
      return;
    }
    var serverMsg = (typeof data === 'string') ? data : JSON.stringify(data);
    modalError('ERROR', 'Error al guardar campo: ' + serverMsg, false, 'Cerrar', 'error', function(){
      $('#modal_camp').modal('close');
    });
  }).fail(function(xhr, status, error){
    var msg = '';
    if(xhr && xhr.responseText){
      msg = xhr.status + ' ' + (xhr.statusText || '') + ': ' + xhr.responseText;
    } else {
      msg = status + ' - ' + error;
    }
    modalError('ERROR', 'Error en la petición al guardar campo. ' + msg, false, 'Cerrar', 'error', function(){
      $('#modal_camp').modal('close');
    });
  });
};

// Click en guardar (botón común #camp_save)
$(document.body).on('click', '#camp_save', function(){
  if($('#modal_camp').length && $('#modal_camp').is(':visible')){
    modalConfirm("Guardar campo", "¿Estás seguro de que quieres guardar los cambios?\n\n", false, "Guardar", "Cancelar", "save", "clear", function(){
      saveCampo();
    }, function(){
      // cancel
    });
  }
});

var openCampo = function(seccion, cual, id){
  if(cual === 'frm_editcamp'){
    CamposAPI.list({ filtro_id: id }).done(function(res){
      var datos = (res && res.resultados) ? res.resultados : [];
      if(datos.length === 0){
        modalError('ERROR', 'No se encontró el campo', false, 'Cerrar', 'error');
        return;
      }
      var item = datos[0];
      var title = " Editar campo - " + (item.nombre || '');
      $("#modal_"+seccion).find(".modal_txt_title").text(title);
      $("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
      $("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");

        var frm = '<form id="campo_frm_editar">' +
          '<div class="row">' +
            '<div class="input-field anchoFrm4 left">' +
              '<input type="number" id="id_revision_camp" name="id_revision" value="'+ (item.id_revision || '') +'" autocomplete="off">' +
              '<label for="id_revision_camp" class="active">ID Revisión</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<select id="tipo_camp" name="tipo">' +
                '<option value="MEDIDAS" '+ ((item.tipo=='MEDIDAS')? 'selected':'') +'>MEDIDAS</option>' +
                '<option value="CARACTERISTICAS" '+ ((item.tipo=='CARACTERISTICAS')? 'selected':'') +'>CARACTERISTICAS</option>' +
              '</select>' +
              '<label for="tipo_camp" class="active">Tipo</label>' +
            '</div>' +
          '</div>' +
          '<div class="row">' +
            '<div class="input-field anchoFrm4 left">' +
              '<input type="text" id="nombre_camp" name="nombre" value="'+ (item.nombre || '') +'" autocomplete="off">' +
              '<label for="nombre_camp" class="active">Nombre</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="text" id="abrev_camp" name="abrev" value="'+ (item.abrev || '') +'" autocomplete="off">' +
              '<label for="abrev_camp" class="active">Abreviatura</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="text" id="unidad_camp" name="unidad" value="'+ (item.unidad || '') +'" autocomplete="off">' +
              '<label for="unidad_camp" class="active">Unidad</label>' +
            '</div>' +
          '</div>' +
          '<div class="input-field" style="display:none;">' +
            '<input type="text" id="id_camp" name="id" value="'+ (item.id || '') +'">' +
          '</div>' +
        '</form>';

        $("#modal_"+seccion).find(".contentForm").html(frm);
        $("#modal_"+seccion).modal({ dismissible: false });
        $("#modal_"+seccion).modal('open');
    }).fail(function(){
      modalError('ERROR','Error cargando campo',false,'Cerrar','error');
    });
  } else if(cual === 'frm_newcamp'){
    var title = 'Nuevo campo';
    $("#modal_"+seccion).find(".modal_txt_title").text(title);
    $("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
    $("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");

    var frm = '<form id="campo_frm_nuevo">' +
      '<div class="row">' +
        '<div class="input-field anchoFrm4 left">' +
          '<input type="number" id="id_revision_camp" name="id_revision" value="" autocomplete="off">' +
          '<label for="id_revision_camp">ID Revisión</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<select id="tipo_camp" name="tipo">' +
            '<option value="MEDIDAS">MEDIDAS</option>' +
            '<option value="CARACTERISTICAS">CARACTERISTICAS</option>' +
          '</select>' +
          '<label for="tipo_camp">Tipo</label>' +
        '</div>' +
      '</div>' +
      '<div class="row">' +
        '<div class="input-field anchoFrm4 left">' +
          '<input type="text" id="nombre_camp" name="nombre" value="" autocomplete="off">' +
          '<label for="nombre_camp">Nombre</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="text" id="abrev_camp" name="abrev" value="" autocomplete="off">' +
          '<label for="abrev_camp">Abreviatura</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="text" id="unidad_camp" name="unidad" value="" autocomplete="off">' +
          '<label for="unidad_camp">Unidad</label>' +
        '</div>' +
      '</div>' +
    '</form>';

    $("#modal_"+seccion).find(".contentForm").html(frm);
    $("#modal_"+seccion).modal({ dismissible: false });
    $("#modal_"+seccion).modal('open');
    setTimeout(function(){ $('#id_revision_camp').focus(); }, 200);
  }
};

// Permitir pulsar Enter en los campos de filtro para ejecutar la búsqueda
jQuery(document).on('keydown', '#Campos [id*=filtro_campos]', function(e){
    jQuery('#filtrar_campos_clear').removeClass('hide');
    if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
        e.preventDefault();
        jQuery(this).closest('#Campos').find('#filtrar_campos').click();
    }
});

// Limpiar filtros de campos
jQuery(document).on('click', '#filtrar_campos_clear', function() {
  jQuery(this).addClass('hide');
  var $parent = jQuery(this).closest('#Campos');
  $parent.find('#filtro_campos_nombre').val('');
  $parent.find('#filtro_campos_total').val('15');
  $parent.find('label').not(':eq(0)').removeClass('active');
  $parent.find('#filtrar_campos').click();
});

// Menú contextual para cada fila de campos (ocultar visualmente la fila / eliminar)
jQuery(document).on('click', '.more_camp', function(e){
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
          "Eliminar campo",
          "¿Eliminar campo? Esta acción es irreversible.",
          false,
          "Eliminar",
          "Cancelar",
          "delete_forever",
          "cancel",
          function(){
            CamposAPI.remove(itemId)
              .done(function(resp){
                if($.trim(resp) === 'OK'){
                  $('#filtrar_campos').click();
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
      jQuery(document).on('click.rowMenuCloseCamp', function(ev){
        if(jQuery(ev.target).closest('.row-menu').length===0 && jQuery(ev.target).closest('.more_camp').length===0){
          jQuery('.row-menu').remove();
          jQuery(document).off('click.rowMenuCloseCamp');
        }
      });
    }, 10);
});
