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

      var tr = "<tr>";
      tr += "<td>" + id + "</td>";
      tr += "<td>" + tarifa + "</td>";
      tr += "<td>" + precio + "</td>";
      tr += "<td><button class='btn-small red eliminar_tarifa' data-id='" + id + "'>Eliminar</button></td>";
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