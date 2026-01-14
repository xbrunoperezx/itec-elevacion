// Funciones CRUD para administración de usuarios (cliente-side)
// Usa jQuery para llamadas AJAX a services/usuarios.php

var MD5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}

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
      tr += "<td class='ancho30'>" + id + "</td>";
      var editBtn = '';
      if (parseInt(item.editable, 10) === 1) {
        editBtn = "<a seccion='usu' tipo='frm_editusu' data-id='"+id+"' class='editar_usr btn-floating btn-small waves-effect waves-light green' title='Editar usuario'><i class='material-icons'>edit</i></a>&nbsp;";
      }
      tr += "<td class='ancho50'>" + editBtn + "</td>";
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

// funcion guardar el usuario (nuevo/editar)
var saveUsuario = function() {

  // indicar estado en el modal de confirmación
  $('#confirm-message').text("...guardando los cambios...");

  var id = $('#id_usr').val();
  var user = ($('#user_usr').val() || '').trim();
  var password = ($('#password_usr').val() || '');
  var name = ($('#name_usr').val() || '').trim();
  var email = ($('#email_usr').val() || '').trim();
  var extension = ($('#extension_usr').val() || '').trim();
  var pphone = ($('#pphone_usr').val() || '').trim();
  var oficina = ($('#oficina_usr').val() || '').trim();
  var puesto = ($('#puesto_usr').val() || '').trim();
  var tipo = ($('#tipo_usr').val() || '').trim();
  var abrev = ($('#abrev_usr').val() || '').trim();
  var equipos = ($('#equipos_usr').val() || '').trim();

  var usuario = {
    user: user,
    password: password,
    name: name,
    email: email,
    extension: extension,
    pphone: pphone,
    oficina: oficina,
    puesto: puesto,
    tipo: tipo,
    abrev: abrev,
    equipos: equipos
  };

  if (typeof id !== 'undefined' && id !== null && String(id).trim() !== '') {
    usuario.id = id;
  }

  $.ajax({
    url: 'services/usuarios_save.php',
    type: 'POST',
    data: usuario,
    success: function(data){
      if (typeof data === 'string' && data.trim() === 'OK'){
        $('#modal_confirm').modal('close');
        $('#modal_usu').modal('close');
        $('#filtrar_usuarios').click();
        return;
      }
      var serverMsg = (typeof data === 'string') ? data : JSON.stringify(data);
      modalError('ERROR', 'Error al guardar usuario: ' + serverMsg, false, 'Cerrar', 'error', function(){
        $('#modal_usu').modal('close');
      });
    },
    error: function(xhr, status, error){
      var msg = '';
      if(xhr && xhr.responseText){
        msg = xhr.status + ' ' + (xhr.statusText || '') + ': ' + xhr.responseText;
      } else {
        msg = status + ' - ' + error;
      }
      modalError('ERROR', 'Error en la petición al guardar usuario. ' + msg, false, 'Cerrar', 'error', function(){
        $('#modal_usu').modal('close');
      });
    }
  });
}; // end saveUsuario()


// Click en guardar (botón común #cli_save). Solo actuar si el modal usuario está abierto
$(document.body).on('click', '#cli_save', function(){
  if($('#modal_usu').length && $('#modal_usu').is(':visible')){
    modalConfirm("Guardar cambios en usuario", "¿Estás seguro de que quieres guardar los cambios?\n\n", false, "Guardar", "Cancelar", "save", "clear", function(){
      saveUsuario();
    }, function(){
      // cancel
    });
  }
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
        var title = " Editar usuario - " + (item.user || '');
        $("#modal_"+seccion).find(".modal_txt_title").text(title);
        $("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
        $("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");

        var frm = '<form id="usuario_frm_editar">' +
          '<div class="row">' +
            '<div class="input-field anchoFrm4 left">' +
              '<input type="text" id="user_usr" name="user" value="'+ (item.user || '') +'" autocomplete="off">' +
              '<label for="user_usr" class="active">Usuario</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="password" id="password_usr" name="password" value="" autocomplete="off">' +
              '<label for="password_usr">Cambiar contraseña</label>' +
            '</div>' +
          '</div>' +
          '<div class="input-field">' +
            '<input type="text" id="name_usr" name="name" value="'+ (item.name || '') +'" autocomplete="off">' +
            '<label for="name_usr" class="active">Nombre</label>' +
          '</div>' +
          '<div class="input-field">' +
            '<input type="text" id="email_usr" name="email" value="'+ (item.email || '') +'" autocomplete="off">' +
            '<label for="email_usr" class="active">Email</label>' +
          '</div>' +
          '<div class="row">' +
            '<div class="input-field anchoFrm4 left">' +
              '<input type="text" id="pphone_usr" name="pphone" value="'+ (item.pphone || '') +'" autocomplete="off">' +
              '<label for="pphone_usr" class="active">Teléfono</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="text" id="extension_usr" name="extension" value="'+ (item.extension || '') +'" autocomplete="off">' +
              '<label for="extension_usr" class="active">Extensión</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
            '<input type="text" id="oficina_usr" name="oficina" value="'+ (item.oficina || '') +'" autocomplete="off">' +
            '<label for="oficina_usr" class="active">Oficina</label>' +
            '</div>' +
          '</div>' +
          '<div class="row">' +
            '<div class="input-field anchoFrm4 left">' +
              '<input type="text" id="puesto_usr" name="puesto" value="'+ (item.puesto || '') +'" autocomplete="off">' +
              '<label for="puesto_usr" class="active">Puesto</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
              '<input type="text" id="abrev_usr" name="abrev" value="'+ (item.abrev || '') +'" autocomplete="off">' +
              '<label for="abrev_usr" class="active">Abreviatura</label>' +
            '</div>' +
            '<div class="input-field anchoFrm4 inline">' +
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
      '<div class="row">' +
        '<div class="input-field anchoFrm4 left">' +
          '<input type="text" id="user_usr" name="user" value="" autocomplete="off">' +
          '<label for="user_usr">Usuario</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="password" id="password_usr" name="password" value="" autocomplete="off">' +
          '<label for="password_usr">Contraseña</label>' +
        '</div>' +
      '</div>' +
      '<div class="input-field">' +
        '<input type="text" id="name_usr" name="name" value="" autocomplete="off">' +
        '<label for="name_usr">Nombre</label>' +
      '</div>' +
      '<div class="input-field">' +
        '<input type="text" id="email_usr" name="email" value="" autocomplete="off">' +
        '<label for="email_usr">Email</label>' +
      '</div>' +
      '<div class="row">' +
        '<div class="input-field anchoFrm4 left">' +
          '<input type="text" id="pphone_usr" name="pphone" value="" autocomplete="off">' +
          '<label for="pphone_usr">Teléfono</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="text" id="extension_usr" name="extension" value="" autocomplete="off">' +
          '<label for="extension_usr">Extensión</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="text" id="oficina_usr" name="oficina" value="" autocomplete="off">' +
          '<label for="oficina_usr">Oficina</label>' +
        '</div>' +
      '</div>' +
      '<div class="row">' +
        '<div class="input-field anchoFrm4 left">' +
          '<input type="text" id="puesto_usr" name="puesto" value="" autocomplete="off">' +
          '<label for="puesto_usr">Puesto</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<input type="text" id="abrev_usr" name="abrev" value="" autocomplete="off">' +
          '<label for="abrev_usr">Abreviatura</label>' +
        '</div>' +
        '<div class="input-field anchoFrm4 inline">' +
          '<select id="tipo_usr" name="tipo">' +
            '<option value="admin">admin</option>' +
            '<option value="inspector">inspector</option>' +
            '<option value="auxiliar">auxiliar</option>' +
          '</select>' +
          '<label for="tipo_usr">Tipo</label>' +
        '</div>' +
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
