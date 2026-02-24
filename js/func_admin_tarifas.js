// Funciones CRUD para administración de tarifas
// Basado en func_admin_campos.js - adaptado a 'tarifas'

var TarifasAPI = (function(){
  function request(data){
    return $.ajax({
      url: 'services/tarifas.php',
      method: 'POST',
      data: data,
      dataType: 'json'
    });
  }

  return {
    list: function(filters){
      filters = filters || {};
      var payload = $.extend({action: 'list', filtro_tarifas_total: 15}, filters);
      return request(payload);
    },
    create: function(tarifa){
      var payload = $.extend({action: 'create'}, tarifa);
      return request(payload);
    },
    update: function(id, tarifa){
      var payload = $.extend({action: 'update', id: id}, tarifa);
      return request(payload);
    },
    remove: function(id){
      return request({action: 'delete', id: id});
    }
  };
})();

// Render lista de tarifas en el contenedor #Tarifas
function readTarifas(){
  var total = parseInt($('#filtro_tarifas_total').val(), 10) || 15;
  var nombre = ($('#filtro_tarifas_nombre').val() || '').trim();
  var filtros = { filtro_tarifas_total: total };
  if(nombre) filtros.filtro_tarifa = nombre;

  $('#table_tarifas tbody').empty();
  $('#resultados_tarifas').html('Cargando...');

  TarifasAPI.list(filtros).done(function(res){
    var datos = (res && res.resultados) ? res.resultados : [];
    var totalResultados = 0;

    datos.forEach(function(item){
      var id = item.id || '';
      var tarifa = item.tarifa || '';
      var precio = item.precio || '';

      var tr = "<tr class='alto50'>";
        tr += "<td class='ancho50'>&nbsp;</td>";
        tr += "<td class='ancho30'>" + id + "</td>";
        tr += "<td class='ancho50'>&nbsp;</td>";
        tr += "<td class='ancho80'>" + tarifa + "</td>";
        tr += "<td class='ancho80'>" + precio + "</td>";
        tr += "<td class='ancho50'>&nbsp;</td>";
        tr += "<td class='ancho50'>" +
            "<a class='more_tarifa btn-floating btn-small waves-effect waves-light red' title='Más' data-id='" + id + "'>" +
            "<i class='material-icons'>more_vert</i></a>" +
            "</td>";
        tr += "</tr>";

      $('#table_tarifas tbody').append(tr);
      totalResultados++;
    });

    $('#resultados_tarifas').html('<span>Total de resultados: ' + totalResultados + '</span>');
  }).fail(function(){
    $('#resultados_tarifas').html('Error cargando tarifas');
  });
}

// Inicializar la pestaña Tarifas al cargar la página
$(function(){
  if($('#Tarifas').length) readTarifas();

  $(document).on('click', '#filtrar_tarifas', function(e){
    e.preventDefault();
    readTarifas();
  });

  $(document).on('click', '#add_tarifas', function(e){
    e.preventDefault();
    // Aquí puedes abrir un modal para agregar una nueva tarifa
  });

  $(document).on('click', '.eliminar_tarifa', function(e){
    e.preventDefault();
    var id = $(this).data('id');
    TarifasAPI.remove(id).done(function(){
      readTarifas();
    }).fail(function(){
      alert('Error al eliminar la tarifa');
    });
  });
});

//-----------------------------------------------
//abrir modal y actualizarlo
$(document).on('click', '#add_tarifas', function(e) {
  e.preventDefault();

  // Actualizar el título del modal
  $('#modal_usu .modal_txt_title').text('Nueva Tarifa');

  // Actualizar el contenido del formulario
  var formHtml = `
    <div class="row">
      <div class="input-field col s12">
        <input id="nueva_tarifa" type="text">
        <label for="nueva_tarifa">Nombre de la Tarifa</label>
      </div>
      <div class="input-field col s12">
        <input id="nuevo_precio" type="number">
        <label for="nuevo_precio">Precio</label>
      </div>
    </div>
  `;
  $('#modal_usu .contentForm').html(formHtml);

  // Actualizar el botón de guardar
  $('#modal_usu .modal_txt_btn_left')
    .attr('id', 'guardar_tarifa')
    .html('<i class="material-icons left">save</i>Guardar');

  // Abrir el modal
  $('#modal_usu').modal('open');
});

//----------------------------------------------
//guardar la nueva tarifa
$(document).on('click', '#guardar_tarifa', function(e) {
  e.preventDefault();

  var nuevaTarifa = $('#nueva_tarifa').val();
  var nuevoPrecio = $('#nuevo_precio').val();

  TarifasAPI.create({ tarifa: nuevaTarifa, precio: nuevoPrecio }).done(function() {
    readTarifas(); // Recargar la tabla
    $('#modal_usu').modal('close'); // Cerrar el modal
  }).fail(function() {
    alert('Error al guardar la tarifa');
  });
});

// Add event listener for the dropdown menu
$(document).on('click', '.more_tarifa', function(e){
  e.preventDefault();
  $('.row-menu').remove();

  var $btn = $(this);
  var itemId = $btn.data('id');
  var offset = $btn.offset();

  var menuHtml = "<div class='row-menu'><ul><li class='row-menu-hide'>Ocultar fila</li>";
  menuHtml += "<li class='row-menu-delete'>Eliminar</li>";
  menuHtml += "<li class='row-menu-cancel'>Cancelar</li></ul></div>";
  var menu = $(menuHtml);

  menu.css({ visibility: 'hidden', top: 0, left: 0 });
  $('body').append(menu);

  var menuW = menu.outerWidth();
  var menuH = menu.outerHeight();
  var winW = $(window).width();
  var winTop = $(window).scrollTop();

  var desiredLeft = offset.left + $btn.outerWidth() - menuW;
  if (desiredLeft + menuW > winW - 6) desiredLeft = winW - menuW - 6;
  if (desiredLeft < 6) desiredLeft = 6;

  var desiredTop = offset.top + $btn.outerHeight() + 6;
  if (desiredTop + menuH > winTop + $(window).height()) {
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
      alert('Eliminar opción seleccionada para tarifa ID: ' + itemId);
      menu.remove();
  });

  menu.on('click', '.row-menu-cancel', function(ev){
      ev.stopPropagation();
      menu.remove();
  });

  setTimeout(function(){
      $(document).on('click.rowMenuCloseTarifa', function(ev){
          if($(ev.target).closest('.row-menu').length===0 && $(ev.target).closest('.more_tarifa').length===0){
              $('.row-menu').remove();
              $(document).off('click.rowMenuCloseTarifa');
          }
      });
  }, 10);
});