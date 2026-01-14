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
      tr += "<td class='ancho50'>" + id + "</td>";
      tr += "<td class='ancho50'>" +
            "<a seccion='usu' tipo='frm_editusu' data-id='"+id+"' class='editar_usr btn-floating btn-small waves-effect waves-light green' title='Editar usuario'><i class='material-icons'>edit</i></a>&nbsp;" +
            "</td>";
      tr += "<td>" + nombreUsr + "</td>";
      tr += "<td class='ancho50'><a class='btn-floating btn-small waves-effect waves-light ";
      if(tipo=="admin"){
        tr += "black";
      }else if(tipo=="inspector"){
        tr += "green";
      }else if(tipo=="auxiliar"){
        tr += "blue darken-2";
      }else{
        tr += "grey";
      }
      tr += "' title='" + usuario + "'>" + abrev + "</a>&nbsp;</td>";
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

  // Click en crear nuevo usuario (abrir popup)
  $(document).on('click', '#add_usuarios', function(e){
    e.preventDefault();
    window.openModal('usu', 'frm_newusu');
  });

  // Click en editar usuario: abrir modal de edición pasando el id
  $(document).on('click', '.editar_usr', function(e){
    e.preventDefault();
    var id = $(this).data('id');
    window.openModal('usu', 'frm_editusu', id);
  });
});

var openUsuario = function(seccion, cual, id){
  if(cual === 'frm_editusu'){
    var totalParams = { filtro_id: id };
    $.ajax({
      url: 'services/usuarios.php',
      type: 'POST',
      data: totalParams,
      success: function(data){
        var item = JSON.parse(data).resultados[0];
        var title = "Editar usuario - " + (item.user || '');
        $("#modal_"+seccion).find(".modal_txt_title").text(title);
        $("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
        $("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");

        var frm = '<form id="usuario_frm_editar">' +
          '<div class="row">' +
            '<div class="input-field anchoFrm2">' +
              '<input type="text" id="user_usr" name="user" value="'+ (item.user || '') +'">' +
              '<label for="user_usr" class="active">Usuario</label>' +
            '</div>' +
            '<div class="input-field anchoFrm2">' +
              '<input type="password" id="password_usr" name="password" value="">' +
              '<label for="password_usr">Contraseña (dejar en blanco para no cambiar)</label>' +
            '</div>' +
          '</div>' +
          '<div class="input-field">' +
            '<input type="text" id="name_usr" name="name" value="'+ (item.name || '') +'">' +
            '<label for="name_usr" class="active">Nombre</label>' +
          '</div>' +
          '<div class="input-field">' +
            '<input type="text" id="email_usr" name="email" value="'+ (item.email || '') +'">' +
            '<label for="email_usr" class="active">Email</label>' +
          '</div>' +
          '<div class="row">' +
            '<div class="input-field anchoFrm2">' +
              '<input type="text" id="extension_usr" name="extension" value="'+ (item.extension || '') +'">' +
              '<label for="extension_usr" class="active">Extensión</label>' +
            '</div>' +
            '<div class="input-field anchoFrm2">' +
              '<input type="text" id="pphone_usr" name="pphone" value="'+ (item.pphone || '') +'">' +
              '<label for="pphone_usr" class="active">Teléfono</label>' +
            '</div>' +
          '</div>' +
          '<div class="input-field">' +
            '<input type="text" id="oficina_usr" name="oficina" value="'+ (item.oficina || '') +'">' +
            '<label for="oficina_usr" class="active">Oficina</label>' +
          '</div>' +
          '<div class="input-field">' +
            '<input type="text" id="puesto_usr" name="puesto" value="'+ (item.puesto || '') +'">' +
            '<label for="puesto_usr" class="active">Puesto</label>' +
          '</div>' +
          '<div class="row">' +
            '<div class="input-field anchoFrm2">' +
              '<input type="text" id="abrev_usr" name="abrev" value="'+ (item.abrev || '') +'">' +
              '<label for="abrev_usr" class="active">Abreviatura</label>' +
            '</div>' +
            '<div class="input-field anchoFrm2">' +
              '<select id="tipo_usr" name="tipo">' +
                '<option value="admin" '+ ((item.tipo==='admin')? 'selected':'') +'>admin</option>' +
                '<option value="inspector" '+ ((item.tipo==='inspector')? 'selected':'') +'>inspector</option>' +
                '<option value="auxiliar" '+ ((item.tipo==='auxiliar')? 'selected':'') +'>auxiliar</option>' +
              '</select>' +
              '<label for="tipo_usr" class="active">Tipo</label>' +
            '</div>' +
          '</div>' +
          '<div class="input-field">' +
            '<textarea id="equipos_usr" name="equipos">'+ (typeof item.equipos === 'object' ? JSON.stringify(item.equipos) : (item.equipos || '')) +'</textarea>' +
            '<label for="equipos_usr" class="active">Equipos (JSON)</label>' +
          '</div>' +
          '<div class="input-field" style="display:none;">' +
            '<input type="text" id="id_usr" name="id" value="'+ (item.id || '') +'">' +
          '</div>' +
        '</form>';

        $("#modal_"+seccion).find(".contentForm").html(frm);
        $("#modal_"+seccion).find('select#tipo_usr').formSelect();
        $("#modal_"+seccion).modal({ dismissible: false });
        $("#modal_"+seccion).modal('open');
        setTimeout(function(){ $('#user_usr').focus(); }, 200);
      },
      error: function(xhr,status,error){
        modalError('ERROR','Error cargando usuario',false,'Cerrar','error');
      }
    });
  } else if(cual === 'frm_newusu'){
    var title = 'Nuevo usuario';
    $("#modal_"+seccion).find(".modal_txt_title").text(title);
    $("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
    $("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");

    var frm = '<form id="usuario_frm_nuevo">' +
      '<div class="input-field">' +
        '<input type="text" id="user_usr" name="user" value="">' +
        '<label for="user_usr">Usuario</label>' +
      '</div>' +
      '<div class="input-field">' +
        '<input type="password" id="password_usr" name="password" value="">' +
        '<label for="password_usr">Contraseña</label>' +
      '</div>' +
      '<div class="input-field">' +
        '<input type="text" id="name_usr" name="name" value="">' +
        '<label for="name_usr">Nombre</label>' +
      '</div>' +
      '<div class="input-field">' +
        '<input type="text" id="email_usr" name="email" value="">' +
        '<label for="email_usr">Email</label>' +
      '</div>' +
      '<div class="input-field anchoFrm2">' +
        '<input type="text" id="extension_usr" name="extension" value="">' +
        '<label for="extension_usr">Extensión</label>' +
      '</div>' +
      '<div class="input-field anchoFrm2">' +
        '<input type="text" id="pphone_usr" name="pphone" value="">' +
        '<label for="pphone_usr">Teléfono</label>' +
      '</div>' +
      '<div class="input-field">' +
        '<input type="text" id="oficina_usr" name="oficina" value="">' +
        '<label for="oficina_usr">Oficina</label>' +
      '</div>' +
      '<div class="input-field">' +
        '<input type="text" id="puesto_usr" name="puesto" value="">' +
        '<label for="puesto_usr">Puesto</label>' +
      '</div>' +
      '<div class="input-field">' +
        '<select id="tipo_usr" name="tipo">' +
          '<option value="admin">admin</option>' +
          '<option value="inspector">inspector</option>' +
          '<option value="auxiliar">auxiliar</option>' +
        '</select>' +
        '<label for="tipo_usr">Tipo</label>' +
      '</div>' +
      '<div class="input-field">' +
        '<input type="text" id="abrev_usr" name="abrev" value="">' +
        '<label for="abrev_usr">Abreviatura</label>' +
      '</div>' +
      '<div class="input-field">' +
        '<textarea id="equipos_usr" name="equipos"></textarea>' +
        '<label for="equipos_usr">Equipos (JSON)</label>' +
      '</div>' +
    '</form>';

    $("#modal_"+seccion).find(".contentForm").html(frm);
    $("#modal_"+seccion).find('select#tipo_usr').formSelect();
    $("#modal_"+seccion).modal({ dismissible: false });
    $("#modal_"+seccion).modal('open');
    setTimeout(function(){ $('#user_usr').focus(); }, 200);
  }
};

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
