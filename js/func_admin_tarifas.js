// Funciones CRUD para administración de tarifas
// Basado en func_admin_campos.js - adaptado a 'tarifas'

// TarifasAPI.list envia solicitud POST al archivo tarifas.php y el back devuelve formato JSON
var TarifasAPI = (function () {
  function request(data) {
    return $.ajax({
      url: 'services/tarifas.php',
      method: 'POST',
      data: data,
      dataType: 'json'
    });
  }

  return {
    list: function (filters) {
      filters = filters || {};
      var payload = $.extend({ action: 'list', filtro_tarifas_total: 15 }, filters);
      return request(payload);
    },
    create: function (tarifa) {
      // Enviar una solicitud POST al backend con los datos de la nueva tarifa
      var payload = $.extend({ action: 'create' }, tarifa);
      return request(payload);// Usa la función request para manejar la solicitud
    },
    update: function (id, tarifa) {
      var payload = $.extend({ action: 'update', id: id }, tarifa);
      return request(payload);
    },
    remove: function (id) {
      return request({ action: 'delete', id: id });
    }
  };
})();

// LEER lista de tarifas en el contenedor #Tarifas
function readTarifas() {
  var total = parseInt($('#filtro_tarifas_total').val(), 10) || 15;//lee el numero de registros filtro_tarif...
  var nombre = ($('#filtro_tarifas_nombre').val() || '').trim();//lee el nombre de la taraifa
  var filtros = { filtro_tarifas_total: total };

  if (nombre) filtros.filtro_tarifa = nombre;

  $('#table_tarifas tbody').empty(); //vacia el contenido de la tabla
  $('#resultados_tarifas').html('Cargando...');

  TarifasAPI.list(filtros).done(function (res) { //envia solicitud AJAX al back con los filtros
    var datos = (res && res.resultados) ? res.resultados : [];
    var totalResultados = 0;

    datos.forEach(function (item) { // itera sobre los resultados devueltos y genera filas en latabla

      var id = item.id || '';
      var tarifa = item.tarifa || '';
      var precio = item.precio || '';

      //cada fila incluye esto : id,nombre de la tarifa,precio + boton MAS con menu desplegable
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
  }).fail(function () {
    $('#resultados_tarifas').html('Error cargando tarifas');
  });
}

// ---Inicializar la pestaña Tarifas al cargar la página---
$(function () {
  $('.modal').modal(); // Inicializa todos los modales
  if ($('#Tarifas').length) readTarifas();

  //---BOTON DE FLTRAR---
  $(document).on('click', '#filtrar_tarifas', function (e) {
    e.preventDefault();
    readTarifas();
  });

  //PROPOSITO..ABRIR MODAL Y ACTUALIZARLO
  //cuando el usuario haga click en el boton se abrira un modal con un formulario para ingresar nombre y precio
  $(document).on('click', '#add_tarifas', function (e) {
    e.preventDefault();//evita el comportamiento predeterminado del boton
    //actualizamos el titulo del modal
    $('#modal_usu .modal_txt_title').text('Nueva tarifa');

    //actualizamos el contenido del formulario dentro del modal
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

    //actualizamos el boton de guardar
    $('#modal_usu .modal_txt_btn_left')
      .attr('id', 'guardar_tarifa') //cambia el ID del boton
      .html('<i class="material-icons left">save</i>Guardar');

    //abrir el modal
    $('#modal_usu').modal('open');
  });

  //----ELIMINAR --------------------------------------------
  $(document).on('click', '.eliminar_tarifa', function (e) {
    e.preventDefault();
    var id = $(this).data('id');
    TarifasAPI.remove(id).done(function () {
      readTarifas();
    }).fail(function () {
      alert('Error al eliminar la tarifa');
    });
  });

  //---GUARDAR la nueva tarifa---
  $(document).on('click', '#guardar_tarifa', function (e) {
    e.preventDefault();

    // Leer los datos ingresados en el formulario
    var nuevaTarifa = $('#nueva_tarifa').val();//captura el nombre de la tarifa
    var nuevoPrecio = $('#nuevo_precio').val();//captura el precio

    //validamos los datos ahroa
    if (!nuevaTarifa || nuevoPrecio <= 0) {
      alert('por favor , ingresa un nombre válido y un precio mayor a 0.');
      return; // se detiene ejecucion si no son validos los campos
    }

    //enviamos los datos la backend
    TarifasAPI.create({ tarifa: nuevaTarifa, precio: nuevoPrecio }).done(function (response) {
      if (response.status === 'OK') { //verificamos el estado de  la respuesta si fue OK
        readTarifas(); // Recargar la tabla
        $('#modal_usu').modal('close'); // Cerrar el modal

      } else {
        alert('Error al guardar la tarifa: ' + response);
      }

    }).fail(function () {
      //si ocurre algun error me da el alert
      alert('Error al guardar la tarifa');
    });
  });

  //--- Add event listener for the dropdown menu---
  $(document).on('click', '.more_tarifa', function (e) {
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

    menu.on('click', '.row-menu-hide', function (ev) {
      ev.stopPropagation();
      var $tr = $btn.closest('tr');
      $tr.addClass('hidden-row');
      menu.remove();
    });

    menu.on('click', '.row-menu-delete', function (ev) {
      ev.stopPropagation();
      alert('Eliminar opción seleccionada para tarifa ID: ' + itemId);
      menu.remove();
    });

    menu.on('click', '.row-menu-cancel', function (ev) {
      ev.stopPropagation();
      menu.remove();
    });

    setTimeout(function () {
      $(document).on('click.rowMenuCloseTarifa', function (ev) {
        if ($(ev.target).closest('.row-menu').length === 0 && $(ev.target).closest('.more_tarifa').length === 0) {
          $('.row-menu').remove();
          $(document).off('click.rowMenuCloseTarifa');
        }
      });
    }, 10);
  });
});







