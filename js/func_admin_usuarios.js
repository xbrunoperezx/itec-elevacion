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
  // leer filtros desde el formulario en admin.html
  var total = parseInt($('#filtro_usuarios_total').val(),10) || 15;
  var nombre = ($('#filtro_usuarios_nombre').val() || '').trim();
  var filtros = { filtro_total: total };
  if(nombre) filtros.filtro_name = nombre;

  // estado inicial en la interfaz
  $('#table_usuarios tbody').empty();
  $('#resultados_cli').html('Cargando...');

  UsuariosAPI.list(filtros).done(function(res){
    var datos = (res && res.resultados) ? res.resultados : [];
    var totalResultados = 0;

    datos.forEach(function(item){
      var id = item.id || '';
      var usuario = item.user || item.usuario || '';
      var nombreUsr = item.name || item.nombre || '';
      var email = item.email || item.mail || '';

      var tr = "<tr>";
      tr += "<td class='ancho50'>&nbsp;</td>";
      tr += "<td class='ancho75'>" + id + "</td>";
      tr += "<td class='ancho50'>" +
            "<a seccion='usu' tipo='frm_editusu' data-id='"+id+"' class='editar_usr btn-floating btn-small waves-effect waves-light green' title='Editar usuario'><i class='material-icons'>edit</i></a>&nbsp;" +
            "</td>";
      tr += "<td><span class='main-text'>" + usuario + "</span><br><span class='secondary-text'></span></td>";
      tr += "<td class='ancho200'>" + nombreUsr + "</td>";
      tr += "<td class='ancho150'>" + email + "</td>";
      tr += "<td class='ancho150'>" +
            "<a class='btn-floating btn-small waves-effect waves-light black' title='Enviar email' href='mailto:"+email+"'><i class='material-icons'>email</i></a>&nbsp;" +
            "<a class='borrar_usr btn-floating btn-small waves-effect waves-light red' title='Eliminar usuario' data-id='"+id+"'><i class='material-icons'>delete_forever</i></a>" +
            "</td>";
      tr += "<td class='ancho50'>" +
            "<a class='more_usr btn-floating btn-small waves-effect waves-light red' title='Más' data-id='"+id+"'><i class='material-icons'>more_vert</i></a>" +
            "</td>";
      tr += "</tr>";

      $('#table_usuarios tbody').append(tr);
      totalResultados++;
    });

    $('#resultados_cli').html('<span class="main-text">Total de resultados:</span> <span class="secondary-text">' + totalResultados + '</span>');
  }).fail(function(xhr, status, err){
    $('#resultados_cli').html('Error cargando usuarios');
  });
}

// Inicializar la pestaña Usuarios al cargar la página
$(function(){
  if($('#Usuarios').length) readUsuarios();
});
