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

      // Aquí insertamos el botón "Editar tarifa"
      tr += "<td class='ancho30'>"; // Nueva celda para el botón
      tr += "<a class='editar_tarifa btn-floating btn-small waves-effect waves-light green' data-id='" + id + "' title='Editar tarifa'>";
      tr += "<i class='material-icons'>edit</i></a>";
      tr += "</td>";

      // Botón "Más" ya existente
      tr += "<td class='ancho50'>" +
        "<a class='more_tarifa btn-floating btn-small waves-effect waves-light red' title='Más' data-id='" + id + "'>" +
        "<i class='material-icons'>more_vert</i></a>" +
        "</td>";
      tr += "</tr>";

      $('#table_tarifas tbody').append(tr);// Agrega la fila a la tabla
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

  //PROPOSITO..ABRIR MODAL Y CREAR
  //cuando el usuario haga click en el boton se abrira un modal con un formulario para ingresar nombre y precio
  //-----CREATE...............................................
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

  //---GUARDAR la nueva tarifa Cuando el usuario crea una tarifa desde 0---
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

  //Evento abrir el modal de UPDATE
  $(document).on('click', '.editar_tarifa', function (e) {
    e.preventDefault(); // evita comportamiento predeterminado del boton de clic

    //obtiene el ID de la tarifa desde el boton
    var id = $(this).data('id');
    console.log('ID obtenido del botón:', id); // Log para verificar el ID obtenido

    //Solicita los datos de la tarifa al back
    TarifasAPI.list({ filtro_id: id }).done(function (response) {
      console.log('Respuesta del backend:', response); // Log para verificar la respuesta del backend
      var datos = response.resultados || []; //obtiene los resultados de la respuesta
      if (datos.length === 0) {
        alert('No se encontró la tarifa'); // muestra un error si no hay datos
        return;
      }

      //Bsucamos el elemento que coincida con el ID recibido
      var item = datos.find(function() {
        return item.id == id;// comparamos el ID recibido con el ID de cada  tarifa del array

      });

      if (!item) {
        alert ('No se encontro la tarifa con ID proporcionado.');
        return;
      }

      console.log('Datos de la tarifa cargados en el modal:', item); // Log para verificar los datos cargados

      //actualiza el titulo del modal con el nombre de la tarifa
      $('#modal_usu .modal_txt_title').text('Editar tarifa - ' + item.tarifa);

      // Llena el formulario del modal con los datos de la tarifa
      var formHtml = `
            <div class="row">
                <div class="input-field col s12">
                    <input id="editar_tarifa" type="text" value="${item.tarifa}">
                    <label for="editar_tarifa" class="active">Nombre de la Tarifa</label>
                </div>
                <div class="input-field col s12">
                    <input id="editar_precio" type="number" value="${item.precio}">
                    <label for="editar_precio" class="active">Precio</label>
                </div>
            </div>
        `;
      $('#modal_usu .contentForm').html(formHtml); // Inserta el formulario en el modal
      
      //cambia el boton de guardar para que tenga el ID y acción correctos
      $('#modal_usu .modal_txt_btn_left')
          .attr('id', 'guardar_cambios_tarifa') //cambia el ID del boton
          .data('id', id) //almacena el ID de la tarifa en el boton
          .html('<i class="material-icons left">save</i>Guardar'); //cambia el texto del boton

      $('#modal_usu').modal('open'); //abre el modal      

    }).fail(function() {
      alert('Error al cargar los datos de la tarifa'); //si la solicitud falla muestra error.
    });
  })


  //--GUARDAR los cambios de la tarifa esta es del UPDATE----
  $(document).on('click', '#guardar_cambios_tarifa', function(e){
    e.preventDefault(); // evita comportamiento predeterminado del boton de clic

    var id = $(this).data('id'); // Obtiene el ID de la tarifa desde el botón
    var tarifa = $('#editar_tarifa').val(); // Obtiene el nuevo nombre de la tarifa
    var precio = $('#editar_precio').val(); // Obtiene el nuevo precio de la tarifa

    // Valida los datos antes de enviarlos
    if (!tarifa || precio <= 0) {
        alert('Por favor, ingresa un nombre válido y un precio mayor a 0.'); // Muestra un error si los datos no son válidos
        return; // Detiene la ejecución si los datos no son válidos
    }

    //envia los datos la back para actualizar la tarifa
    TarifasAPI.update(id, {tarifa: tarifa , precio: precio}).done(function(response) {
      if (response.status === 'OK') {
        readTarifas(); // Recarga la tabla de tarifas
        $('#modal_usu').modal('close'); // Cierra el modal
      } else {
        alert('Error al guardar los cambios: ' + response.message); // Muestra un error si la actualización falla
      }
    }).fail(function () {
        alert('Error al guardar los cambios'); // Muestra un error si la solicitud falla
    });

  })


  //--- Add event listener for the dropdown menu boton rojo derecha---
  //--CONTIENE EL DELETE--------------
  $(document).on('click', '.more_tarifa', function (e) {
    e.preventDefault();
    $('.row-menu').remove();

    var $btn = $(this);
    var itemId = $btn.data('id');
    var offset = $btn.offset();

    var menuHtml = "<div class='row-menu'><ul>";
    menuHtml += "<li class='row-menu-delete' data-id='" + itemId + "'>Eliminar</li>";
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

    menu.on('click', '.row-menu-delete', function (ev) {
      ev.stopPropagation();
      var id = $(this).data('id'); //obtenemos aqui el ID  dela tarifa que qeremos eliminar
      if (confirm('¿Estás seguro de que deseas eliminar esta tarifa?')) {
        TarifasAPI.remove(id).done(function () {
          readTarifas(); // Recargar la tabla
        }).fail(function () {
          alert('Error al eliminar la tarifa');
        });
      }
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







