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
  var email = ($('#filtro_usuarios_email').val() || '').trim();
  var filtros = { filtro_total: total };
  if(nombre) filtros.filtro_name = nombre;
  if(email) filtros.filtro_email = email;

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
      var email = item.email || '';
      if(email !== ''){
        emailIcon = "<a class='btn-floating btn-small waves-effect waves-light black' title='Enviar email' href='mailto:"+email+"'><i class='material-icons'>email</i></a>";
      }else{
        emailIcon = '';
      }
      var puesto = item.puesto || '';
      var tipo = item.tipo || '';
      var abrev = item.abrev || '';
      var tipoIcon = '';
      if(tipo === 'admin'){
        tipoIcon = "<a class='btn-floating btn-small waves-effect waves-light black' title='Administrador'><i class='material-icons'>settings</i></a>";
      } else if(tipo === 'inspector'){
        tipoIcon = "<a class='btn-floating btn-small waves-effect waves-light green' title='Inspector'><i class='material-icons'>assignment_ind</i></a>";
      } else if(tipo === 'auxiliar'){
        tipoIcon = "<a class='btn-floating btn-small waves-effect waves-light blue darken-2' title='Auxiliar'><i class='material-icons'>person</i></a>";
      } else {
        tipoIcon = tipo; // fallback: mostrar texto si no coincide
      }
      var equipos = item.equipos || {};

      var tr = "<tr class='alto50'>";
      tr += "<td class='ancho50'>&nbsp;</td>";
      tr += "<td class='ancho75'>" + id + "</td>";
      tr += "<td class='ancho100'>" +
            "<a seccion='usu' tipo='frm_editusu' data-id='"+id+"' class='editar_usr btn-floating btn-small waves-effect waves-light green' title='Editar usuario'><i class='material-icons'>edit</i></a>&nbsp;" +
            "<a class='btn-floating btn-small waves-effect waves-light grey' title='" + usuario + "'>" + abrev + "</a>" +
            "</td>";
      tr += "<td>" + nombreUsr + "</td>";
      tr += "<td class='ancho200'><span class='main-text'>" + usuario + "</span></td>";
      tr += "<td class='ancho200'>" + email + "</td>";
      tr += "<td class='ancho50'>" + tipoIcon + "</td>";
      tr += "<td class='ancho200'>" + puesto + "</td>";
      tr += "<td class='ancho150'>" + emailIcon + "&nbsp;";
      if(Object.keys(equipos).length > 0){
        tr += "<a class='btn-floating btn-small waves-effect waves-light red' title='";
        for(var eqId in equipos){
          tr += eqId + " - " + equipos[eqId] +"\n";
        }
        tr += "'><i class='material-icons'>business_center</i></a>";
      }
      tr += "</td>";
      tr += "<td class='ancho50'>" +
            "<a class='more_usr btn-floating btn-small waves-effect waves-light red' title='Más' data-id='"+id+"' data-tipo='"+tipo+"'><i class='material-icons'>more_vert</i></a>" +
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

  // Click en el botón filtrar: refresca la lista con los filtros actuales
  $(document).on('click', '#filtrar_usuarios', function(e){
    e.preventDefault();
    var total = parseInt($('#filtro_usuarios_total').val(), 10) || 0;
    if (total >= 1) {
      readUsuarios();
    } else {
      modalError('ERROR', 'Hay que introducir un número mínimo de resultados esperados! Para ello introduce un valor en el campo registros.', false);
    }
  });
});

// Permitir pulsar Enter en los campos de filtro para ejecutar la búsqueda
jQuery(document).on('keydown', '#Usuarios [id*=filtro_usuarios]', function(e){
    // Mostrar botón limpiar cuando se escribe
    jQuery('#filtrar_usuarios_clear').removeClass('hide');
    if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
        e.preventDefault();
        jQuery(this).closest('#Usuarios').find('#filtrar_usuarios').click();
    }
});

// Limpiar filtros de usuarios
jQuery(document).on('click', '#filtrar_usuarios_clear', function() {
  jQuery(this).addClass('hide');
  var $parent = jQuery(this).closest('#Usuarios');
  $parent.find('#filtro_usuarios_nombre').val('');
  $parent.find('#filtro_usuarios_email').val('');
  $parent.find('#filtro_usuarios_total').val('15');
  $parent.find('label').not(':eq(0)').removeClass('active');
  $parent.find('#filtrar_usuarios').click();
});

// Menú contextual para cada fila de usuarios (ocultar visualmente la fila / cancelar)
jQuery(document).on('click', '.more_usr', function(e){
    e.preventDefault();
    jQuery('.row-menu').remove();

    var $btn = jQuery(this);
    var itemId = $btn.data('id');
    var offset = $btn.offset();

    var itemTipo = $btn.data('tipo');
    var menuHtml = "<div class='row-menu'><ul><li class='row-menu-hide'>Ocultar fila</li>";
    if (itemTipo !== 'admin'){
      menuHtml += "<li class='row-menu-delete'>Eliminar</li>";
    }
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
          "Eliminar usuario",
          "¿Eliminar usuario? Esta acción es irreversible.",
          false,
          "Eliminar",
          "Cancelar",
          "delete_forever",
          "cancel",
          function(){
            $.post('services/usuarios_delete.php', { id: itemId })
              .done(function(resp){
                if($.trim(resp) === 'OK'){
                  // Forzar recarga de la lista mediante el botón filtrar
                  $('#filtrar_usuarios').click();
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
      jQuery(document).on('click.rowMenuCloseUsr', function(ev){
        if(jQuery(ev.target).closest('.row-menu').length===0 && jQuery(ev.target).closest('.more_usr').length===0){
          jQuery('.row-menu').remove();
          jQuery(document).off('click.rowMenuCloseUsr');
        }
      });
    }, 10);
});
