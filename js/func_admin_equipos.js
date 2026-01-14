// Funciones CRUD para administración de equipos (cliente-side)
// Usa jQuery para llamadas AJAX a services/equipos.php

var EquiposAPI = (function(){
  function request(data){
    return $.ajax({
      url: 'services/equipos.php',
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
    create: function(equipo){
      var payload = $.extend({action: 'create'}, equipo);
      return request(payload);
    },
    update: function(id, equipo){
      var payload = $.extend({action: 'update', id: id}, equipo);
      return request(payload);
    },
    remove: function(id){
      return request({action: 'delete', id: id});
    }
  };
})();

// Render lista de equipos en el contenedor #Equipos
function readEquipos(){
  var total = parseInt($('#filtro_equipos_total').val(),10) || 15;
  var nombre = ($('#filtro_equipos_nombre').val() || '').trim();
  var numSerie = ($('#filtro_equipos_num_serie').val() || '').trim();
  var filtros = { filtro_total: total };
  if(nombre) filtros.filtro_nombre = nombre;
  if(numSerie) filtros.filtro_num_serie = numSerie;

  $('#table_equipos tbody').empty();
  $('#resultados_equipos').html('Cargando...');

  EquiposAPI.list(filtros).done(function(res){
    var datos = (res && res.resultados) ? res.resultados : [];
    var totalResultados = 0;

    datos.forEach(function(item){
      var id = item.id || '';
      var codigo = item.codigo || '';
      var nombreEq = item.nombre || '';
      var marca = item.marca || '';
      var modelo = item.modelo || '';
      var numSerieItem = item.num_serie || '';
      var ultima = item.ultima_calibracion_dmy || '';
      var prox = item.prox_calibracion_dmy || '';

      var tr = "<tr class='alto50'>";
      tr += "<td class='ancho50'>&nbsp;</td>";
      tr += "<td class='ancho30'>" + id + "</td>";
      tr += "<td class='ancho50'>" + codigo + "</td>";
      tr += "<td class='ancho30'><a seccion='equ' tipo='frm_editequ' data-id='"+id+"' class='editar_equi btn-floating btn-small waves-effect waves-light green' title='Editar equipo'><i class='material-icons'>edit</i></a></td>";
      tr += "<td>" + nombreEq + "</td>";
      tr += "<td class='ancho150'>" + marca + "</td>";
      tr += "<td class='ancho150'>" + modelo + "</td>";
      tr += "<td class='ancho150'>" + numSerieItem + "</td>";
      tr += "<td class='ancho150'>" + ultima + "</td>";
      tr += "<td class='ancho150'>" + prox + "</td>";
      tr += "<td class='ancho50'>&nbsp;</td>";
      tr += "<td class='ancho50'>" +
            "<a class='more_equi btn-floating btn-small waves-effect waves-light red' title='Más' data-id='"+id+"'><i class='material-icons'>more_vert</i></a>" +
            "</td>";
      tr += "</tr>";

      $('#table_equipos tbody').append(tr);
      totalResultados++;
    });

    $('#resultados_equipos').html('<span class="main-text">Total de resultados:</span> <span class="secondary-text">' + totalResultados + '</span>');
  }).fail(function(){
    $('#resultados_equipos').html('Error cargando equipos');
  });
}

// Inicializar la pestaña Equipos al cargar la página
$(function(){
  if($('#Equipos').length) readEquipos();

  // Click en el botón filtrar: refresca la lista con los filtros actuales
  $(document).on('click', '#filtrar_equipos', function(e){
    e.preventDefault();
    var total = parseInt($('#filtro_equipos_total').val(), 10) || 0;
    if (total >= 1) {
      readEquipos();
    } else {
      modalError('ERROR', 'Hay que introducir un número mínimo de resultados esperados! Introduce un valor en registros.', false);
    }
  });

  // Click en crear nuevo equipo (abrir popup)
  $(document).on('click', '#add_equipos', function(e){
    e.preventDefault();
    window.openModal('equ', 'frm_newequ');
  });

  // Click en editar equipo: abrir modal de edición pasando el id
  $(document).on('click', '.editar_equi', function(e){
    e.preventDefault();
    var id = $(this).data('id');
    window.openModal('equ', 'frm_editequ', id);
  });
});

// funcion guardar el equipo (nuevo/editar)
var saveEquipo = function() {
  $('#confirm-message').text("...guardando los cambios...");

  var id = $('#id_equ').length ? $('#id_equ').val() : '';
  var codigo = ($('#codigo_equ').val() || '').trim();
  var nombre = ($('#nombre_equ').val() || '').trim();
  var marca = ($('#marca_equ').val() || '').trim();
  var modelo = ($('#modelo_equ').val() || '').trim();
  var num_serie = ($('#num_serie_equ').val() || '').trim();
  var forma_calibracion = ($('#forma_calibracion_equ').val() || '').trim();
  var procedimiento = ($('#procedimiento_equ').val() || '').trim();
  var periodo = ($('#periodo_equ').val() || '').trim();
  var ultima_calibracion = ($('#ultima_calibracion_equ').val() || '').trim();
  var prox_calibracion = ($('#prox_calibracion_equ').val() || '').trim();

  var equipo = {
    codigo: codigo,
    nombre: nombre,
    marca: marca,
    modelo: modelo,
    num_serie: num_serie,
    forma_calibracion: forma_calibracion,
    procedimiento: procedimiento,
    periodo: periodo,
    ultima_calibracion: ultima_calibracion,
    prox_calibracion: prox_calibracion
  };

  if (typeof id !== 'undefined' && id !== null && String(id).trim() !== '') {
    equipo.id = id;
  }

  $.ajax({
    url: 'services/equipos_save.php',
    type: 'POST',
    data: equipo,
    success: function(data){
      if (typeof data === 'string' && data.trim() === 'OK'){
        $('#modal_confirm').modal('close');
        $('#modal_equ').modal('close');
        $('#filtrar_equipos').click();
        return;
      }
      var serverMsg = (typeof data === 'string') ? data : JSON.stringify(data);
      modalError('ERROR', 'Error al guardar equipo: ' + serverMsg, false, 'Cerrar', 'error', function(){
        $('#modal_equ').modal('close');
      });
    },
    error: function(xhr, status, error){
      var msg = '';
      if(xhr && xhr.responseText){
        msg = xhr.status + ' ' + (xhr.statusText || '') + ': ' + xhr.responseText;
      } else {
        msg = status + ' - ' + error;
      }
      modalError('ERROR', 'Error en la petición al guardar equipo. ' + msg, false, 'Cerrar', 'error', function(){
        $('#modal_equ').modal('close');
      });
    }
  });
};

// Click en guardar (botón común #equ_save)
$(document.body).on('click', '#equ_save', function(){
  if($('#modal_equ').length && $('#modal_equ').is(':visible')){
    modalConfirm("Guardar equipo", "¿Estás seguro de que quieres guardar los cambios?\n\n", false, "Guardar", "Cancelar", "save", "clear", function(){
      saveEquipo();
    }, function(){
      // cancel
    });
  }
});

var openEquipo = function(seccion, cual, id){
  if(cual === 'frm_editequ'){
    var totalParams = { filtro_id: id };
    $.ajax({
      url: 'services/equipos.php',
      type: 'POST',
      data: totalParams,
      success: function(data){
        var item = (data && data.resultados && data.resultados.length>0) ? data.resultados[0] : {};
        var title = " Editar equipo - " + (item.nombre || '');
        $("#modal_"+seccion).find(".modal_txt_title").text(title);
        $("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
        $("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");

        var frm = '<form id="equipo_frm_editar">' +
          '<div class="row">' +
            '<div class="input-field anchoFrm4 left">' +
              '<input type="text" id="codigo_equ" name="codigo" value="'+ (item.codigo || '') +'" autocomplete="off">' +
              '<label for="codigo_equ" class="active">Código</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="text" id="nombre_equ" name="nombre" value="'+ (item.nombre || '') +'" autocomplete="off">' +
              '<label for="nombre_equ" class="active">Nombre</label>' +
            '</div>' +
          '</div>' +
          '<div class="row">' +
            '<div class="input-field anchoFrm4 left">' +
              '<input type="text" id="marca_equ" name="marca" value="'+ (item.marca || '') +'" autocomplete="off">' +
              '<label for="marca_equ" class="active">Marca</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="text" id="modelo_equ" name="modelo" value="'+ (item.modelo || '') +'" autocomplete="off">' +
              '<label for="modelo_equ" class="active">Modelo</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="text" id="num_serie_equ" name="num_serie" value="'+ (item.num_serie || '') +'" autocomplete="off">' +
              '<label for="num_serie_equ" class="active">Núm. Serie</label>' +
            '</div>' +
          '</div>' +
          '<div class="row">' +
            '<div class="input-field anchoFrm4 left">' +
              '<input type="text" id="forma_calibracion_equ" name="forma_calibracion" value="'+ (item.forma_calibracion || '') +'" autocomplete="off">' +
              '<label for="forma_calibracion_equ" class="active">Forma calibración</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="text" id="procedimiento_equ" name="procedimiento" value="'+ (item.procedimiento || '') +'" autocomplete="off">' +
              '<label for="procedimiento_equ" class="active">Procedimiento</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="text" id="periodo_equ" name="periodo" value="'+ (item.periodo || '') +'" autocomplete="off">' +
              '<label for="periodo_equ" class="active">Periodo</label>' +
            '</div>' +
          '</div>' +
          '<div class="row">' +
            '<div class="input-field anchoFrm4 left">' +
              '<input type="text" id="ultima_calibracion_equ" name="ultima_calibracion" value="'+ (item.ultima_calibracion || '') +'" autocomplete="off">' +
              '<label for="ultima_calibracion_equ" class="active">Última calibración (YYYY-MM-DD)</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="text" id="prox_calibracion_equ" name="prox_calibracion" value="'+ (item.prox_calibracion || '') +'" autocomplete="off">' +
              '<label for="prox_calibracion_equ" class="active">Próxima calibración (YYYY-MM-DD)</label>' +
            '</div>' +
          '</div>' +
          '<div class="input-field" style="display:none;">' +
            '<input type="text" id="id_equ" name="id" value="'+ (item.id || '') +'">' +
          '</div>' +
        '</form>';

        $("#modal_"+seccion).find(".contentForm").html(frm);
        $("#modal_"+seccion).modal({ dismissible: false });
        $("#modal_"+seccion).modal('open');
      },
      error: function(){
        modalError('ERROR','Error cargando equipo',false,'Cerrar','error');
      }
    });
  } else if(cual === 'frm_newequ'){
    var title = 'Nuevo equipo';
    $("#modal_"+seccion).find(".modal_txt_title").text(title);
    $("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
    $("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");

    var frm = '<form id="equipo_frm_nuevo">' +
      '<div class="row">' +
        '<div class="input-field anchoFrm4 left">' +
          '<input type="text" id="codigo_equ" name="codigo" value="" autocomplete="off">' +
          '<label for="codigo_equ">Código</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="text" id="nombre_equ" name="nombre" value="" autocomplete="off">' +
          '<label for="nombre_equ">Nombre</label>' +
        '</div>' +
      '</div>' +
      '<div class="row">' +
        '<div class="input-field anchoFrm4 left">' +
          '<input type="text" id="marca_equ" name="marca" value="" autocomplete="off">' +
          '<label for="marca_equ">Marca</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="text" id="modelo_equ" name="modelo" value="" autocomplete="off">' +
          '<label for="modelo_equ">Modelo</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="text" id="num_serie_equ" name="num_serie" value="" autocomplete="off">' +
          '<label for="num_serie_equ">Núm. Serie</label>' +
        '</div>' +
      '</div>' +
      '<div class="row">' +
        '<div class="input-field anchoFrm4 left">' +
          '<input type="text" id="forma_calibracion_equ" name="forma_calibracion" value="" autocomplete="off">' +
          '<label for="forma_calibracion_equ">Forma calibración</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="text" id="procedimiento_equ" name="procedimiento" value="" autocomplete="off">' +
          '<label for="procedimiento_equ">Procedimiento</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="text" id="periodo_equ" name="periodo" value="" autocomplete="off">' +
          '<label for="periodo_equ">Periodo</label>' +
        '</div>' +
      '</div>' +
      '<div class="row">' +
        '<div class="input-field anchoFrm4 left">' +
          '<input type="text" id="ultima_calibracion_equ" name="ultima_calibracion" value="" autocomplete="off">' +
          '<label for="ultima_calibracion_equ">Última calibración (YYYY-MM-DD)</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="text" id="prox_calibracion_equ" name="prox_calibracion" value="" autocomplete="off">' +
          '<label for="prox_calibracion_equ">Próxima calibración (YYYY-MM-DD)</label>' +
        '</div>' +
      '</div>' +
    '</form>';

    $("#modal_"+seccion).find(".contentForm").html(frm);
    $("#modal_"+seccion).modal({ dismissible: false });
    $("#modal_"+seccion).modal('open');
    setTimeout(function(){ $('#codigo_equ').focus(); }, 200);
  }
};

// Permitir pulsar Enter en los campos de filtro para ejecutar la búsqueda
jQuery(document).on('keydown', '#Equipos [id*=filtro_equipos]', function(e){
    jQuery('#filtrar_equipos_clear').removeClass('hide');
    if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
        e.preventDefault();
        jQuery(this).closest('#Equipos').find('#filtrar_equipos').click();
    }
});

// Limpiar filtros de equipos
jQuery(document).on('click', '#filtrar_equipos_clear', function() {
  jQuery(this).addClass('hide');
  var $parent = jQuery(this).closest('#Equipos');
  $parent.find('#filtro_equipos_nombre').val('');
  $parent.find('#filtro_equipos_num_serie').val('');
  $parent.find('#filtro_equipos_total').val('15');
  $parent.find('label').not(':eq(0)').removeClass('active');
  $parent.find('#filtrar_equipos').click();
});

// Menú contextual para cada fila de equipos (ocultar visualmente la fila / eliminar)
jQuery(document).on('click', '.more_equi', function(e){
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
          "Eliminar equipo",
          "¿Eliminar equipo? Esta acción es irreversible.",
          false,
          "Eliminar",
          "Cancelar",
          "delete_forever",
          "cancel",
          function(){
            $.post('services/equipos_delete.php', { id: itemId })
              .done(function(resp){
                if($.trim(resp) === 'OK'){
                  $('#filtrar_equipos').click();
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
      jQuery(document).on('click.rowMenuCloseEqui', function(ev){
        if(jQuery(ev.target).closest('.row-menu').length===0 && jQuery(ev.target).closest('.more_equi').length===0){
          jQuery('.row-menu').remove();
          jQuery(document).off('click.rowMenuCloseEqui');
        }
      });
    }, 10);
});
