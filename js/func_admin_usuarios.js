// Funciones CRUD para administración de usuarios (cliente-side)
// Usa jQuery para llamadas AJAX a services/usuarios.php

var UsuariosAPI = (function(){
  function request(data){
    return $.ajax({
      url: 'services/usuarios.php',
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
    create: function(usuario){
      var payload = $.extend({action: 'create'}, usuario);
      return request(payload);
    },
    update: function(id, usuario){
      var payload = $.extend({action: 'update', id: id}, usuario);
      return request(payload);
    },
    remove: function(id){
      return request({action: 'delete', id: id});
    }
  };
})();

// Ejemplo de uso:
// UsuariosAPI.list({filtro_nombre: 'Juan'}).done(function(res){ console.log(res); });

// Render lista de usuarios en el contenedor #Usuarios
function readUsuarios(){
  var container = $('#Usuarios');
  container.html('<div id="loading_usuarios">Cargando...</div>');
  UsuariosAPI.list().done(function(res){
    var datos = (res && res.resultados) ? res.resultados : [];
    var html = '';
    html += '<div class="usuarios-list">';
    html += '<div id="resultados_usuarios">Cargando...</div>';
    html += '<table id="table_usuarios" class="striped">';
    html += '<thead><tr><th>Usuario</th><th>Nombre</th><th>Email</th><th>Acciones</th></tr></thead>';
    html += '<tbody></tbody></table>';
    html += '</div>';
    container.html(html);

    var total = 0;
    datos.forEach(function(item){
      var tr = '<tr>';
      tr += '<td>' + (item.user || '') + '</td>';
      tr += '<td>' + (item.name || '') + '</td>';
      tr += '<td>' + (item.email || '') + '</td>';
      tr += '<td>';
      tr += '<a class="editar_usr btn-floating btn-small waves-effect waves-light green" title="Editar usuario" data-id="'+ (item.id || '') + '"><i class="material-icons">edit</i></a>&nbsp;';
      tr += '<a class="borrar_usr btn-floating btn-small waves-effect waves-light red" title="Eliminar usuario" data-id="'+ (item.id || '') + '"><i class="material-icons">delete_forever</i></a>';
      tr += '</td>';
      tr += '</tr>';
      $('#table_usuarios tbody').append(tr);
      total++;
    });
    $('#resultados_usuarios').html('<span class="main-text">Total de resultados:</span> <span class="secondary-text">' + total + '</span>');
  }).fail(function(xhr, status, err){
    $('#Usuarios').html('<div class="error">Error cargando usuarios</div>');
  });
}

// Inicializar la pestaña Usuarios al cargar la página
$(function(){
  if($('#Usuarios').length) readUsuarios();
});
