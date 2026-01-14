// Intervalo de tiempo para la verificación de la sesión
var sessionCheckInterval = setInterval(checkSession, 300000); // 5 minutos

function checkSession() {
  $.ajax({
    type: "POST",
    url: "services/check_session.php",
    success: function(data) {
      if (data === "expired") {
        clearInterval(sessionCheckInterval); // detiene la verificación de la sesión
        window.location.href = "login.html";
      }
    }
  });
} // end checkSession()

checkSession();

function extendSession() {
  $.ajax({
    type: "POST",
    url: "services/extend_session.php",
    success: function(data) {
      if (data === "expired") {
        clearInterval(sessionCheckInterval); // detiene la verificación de la sesión
        window.location.href = "login.html";
      }
    }
  });
} // end extendSession()

var totalClicks = 0;
$(document).on("click", function(){
	totalClicks++;
	if(totalClicks>5){
		extendSession();
		totalClicks=0;
	}
}); // end document clicks

// inicializo el dataLayer si no existe
var dataLayer = dataLayer || [];

// funciones auxiliares
// -----------------------------------------------------------------------------------------------------------------------------------------------------------
function getCookieITEC(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

// Scripts para la aplicacion
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

$(document).ready(function() {

	// Click en editar cliente
	$(document.body).on("click", ".editar_cli", function(){
		var tipo = $(this).attr("tipo");
		var id = $(this).attr("data-id");
		var sec = $(this).attr("seccion");
		openModal(sec, tipo, id);	
	});

	// Click en editar contratada
	$(document.body).on("click", ".editar_con", function(){
		var tipo = $(this).attr("tipo");
		var id = $(this).attr("data-id");
		var sec = $(this).attr("seccion");
		openModal(sec, tipo, id);	
	});
	$(".modal").modal();

	// Click en editar contratada
	$(document.body).on("click", ".editar_pri", function(){
		var tipo = $(this).attr("tipo");
		var id = $(this).attr("data-id");
		var sec = $(this).attr("seccion");
		openModal(sec, tipo, id);	
	});
	$(".modal").modal();

	// funcion de abrir popups en funcion de la seccion y formulario (también recibe el id)
	window.openModal = function(seccion, cual, id){
		$("#modal_"+seccion).find(".modal_txt_title").empty();
		$("#modal_"+seccion).find(".modal_txt_btn_left").empty();
		$("#modal_"+seccion).find(".modal_txt_btn_right").empty();
		if(seccion=="cli"){
			openCliente(seccion, cual, id);
		}
		if(seccion=="con"){
			openContratada(seccion, cual, id);
		}
    if(seccion=="pri"){
      openInforme(seccion, cual, id);
    }
	}

	// Click en los elementos del menú superior
	jQuery(document).on('click', 'nav li', function(e) {
		jQuery('nav li').removeClass('active');
		jQuery(this).addClass('active');
		if($(this).attr('id')=="cli"){
			$("#sectionToggle_cli").show();
		}else if($(this).attr('id')=="con"){
			$("#sectionToggle_con").show();
		}else if($(this).attr('id')=="pri"){
			$("#sectionToggle_pri").show();
		}else if($(this).attr('id')=="seg"){
			$("#sectionToggle_seg").show();
		}
	});

	// Escuchar el evento de click en los elementos del menú
	jQuery(document).on('click', '#nav-desktop li', function(e) {
    var text = $(this).find("a").attr("href").split("#")[1].trim();
      if (text) {
      $('#title_nav').text(text);
    }
    var tipo = $(this).attr('id');
    var filtros = {
      filtro_total : 15
    };
    readTable(tipo, filtros);
	});

	// funcion que realiza las consultas a la API
	var readTable = function(id, filtros){
		// Preparar los parámetros de búsqueda
		var params = {};
		if(typeof filtros == "object"){
			var totalParams = Object.assign({}, params, filtros);
		}else{
			var totalParams = params;
		}
		// Ocultar todo el contenido con div "app-content" y mostrar el loading
		$('#app-content > div').hide();
		$('#app-content > div#loading').show();

		if(id=="cli"){
			readClientes(id, totalParams);
		}
		if(id=="con"){
			readContratadas(id, totalParams);
		}	
		if(id=="pri"){
			readInformes(id, totalParams);
		}	
		if(id=="seg"){
			readSegundas(id, totalParams);
		}		
	}

	// Detectamos los clicks en las cabeceras de las tablas para ordenarlas
	$(document).on("click", "th.orderBy", function() {
    var table = $(this).parents("table").eq(0);
    var texto = $(this).text();
    var rows = table.find("tr:gt(0)").toArray().sort(comparer($(this).index()));
    this.asc = !this.asc;
    if (!this.asc){
    	rows = rows.reverse();
    	$("span.direct").html("");
    	$(this).find("span.direct").html(' [>]');
    }else{
    	$("span.direct").html("");
    	$(this).find("span.direct").html(' [<]');
    }
    for (var i = 0; i < rows.length; i++){table.append(rows[i]);}
  });

	// Forzamos que cargue la lista de clientes al cargar la página
	$('#nav-desktop li:first').click();

  // Cargar nombre de usuario en el nav
  if (typeof loadUserMenu === 'function') loadUserMenu();

	// Botones de ocultar los filtros
	$("#btnToggle_cli").click(function(){
		$("#sectionToggle_cli").toggle();
	});
  	$("#btnToggle_con").click(function(){
		$("#sectionToggle_con").toggle();
	});
	$("#btnToggle_pri").click(function(){
		$("#sectionToggle_pri").toggle();
	});
	$("#btnToggle_seg").click(function(){
		$("#sectionToggle_seg").toggle();
	});

  

}); // end jQuery ready

// Función global para mostrar modal de error
// Nueva firma: modalError(title, message, dismiss, btnText, btnIcon, successCallback)
function modalError(title, message, dismiss, btnText, btnIcon, successCallback) {
  // Asegurarse que dismiss sea booleano
  var dismissible = (typeof dismiss === 'boolean') ? dismiss : false;
  $('#error-title').text(title);
  $('#error-message').html(message);

  // textos por defecto si no se pasan
  var btnTextFinal = (typeof btnText === 'string' && btnText.length>0) ? btnText : 'Aceptar';
  var btnIconFinal = (typeof btnIcon === 'string' && btnIcon.length>0) ? btnIcon : 'check';

  // Actualizar el texto y el icono del botón
  if ($('#error_confirm').length) {
    $('#error_confirm').html('<i class="material-icons left">' + btnIconFinal + '</i>' + btnTextFinal);
  }

  // Guardar callback en el elemento modal para que el handler lo ejecute
  if (typeof successCallback === 'function') {
    $('#modal_error').data('errorCallback', successCallback);
  } else {
    $('#modal_error').removeData('errorCallback');
  }

  // Asegurarnos de limpiar callback si el modal se cierra por fuera
  $('#modal_error').modal({
    dismissible: dismissible,
    onCloseEnd: function() {
      $('#modal_error').removeData('errorCallback');
    }
  });
  $('#modal_error').modal('open');
}

// Función global para modal de confirmación con callbacks
// modalConfirm(title, message, dismiss, confirmCallback, cancelCallback, confirmText, cancelText)
// cancelCallback es opcional y se ejecuta si el usuario cierra o cancela el popup
// confirmText / cancelText son opcionales y reemplazan los textos de los botones
function modalConfirm(title, message, dismiss, confirmText, cancelText, confirmIcon, cancelIcon, confirmCallback, cancelCallback) {
  var dismissible = (typeof dismiss === 'boolean') ? dismiss : false;
  $('#confirm-title').text(title);
  $('#confirm-message').text(message);

  // textos por defecto si no se pasan
  var confirmBtnText = (typeof confirmText === 'string' && confirmText.length>0) ? confirmText : 'Aceptar';
  var cancelBtnText = (typeof cancelText === 'string' && cancelText.length>0) ? cancelText : 'Cancelar';

  // Actualizar los textos de los botones (con icono)
  if ($('#save_confirm').length) {
    $('#save_confirm').html('<i class="material-icons left">' + (confirmIcon || 'check') + '</i>' + confirmBtnText);
  }
  if ($('#save_cancel').length) {
    $('#save_cancel').html('<i class="material-icons left">' + (cancelIcon || 'clear') + '</i>' + cancelBtnText);
  }

  // Guardar callbacks en el elemento modal para que el handler los ejecute
  if (typeof confirmCallback === 'function') {
    $('#modal_confirm').data('confirmCallback', confirmCallback);
  } else {
    $('#modal_confirm').removeData('confirmCallback');
  }
  if (typeof cancelCallback === 'function') {
    $('#modal_confirm').data('confirmCancelCallback', cancelCallback);
  } else {
    $('#modal_confirm').removeData('confirmCancelCallback');
  }

  // Asegurarnos de que si el modal se cierra por fuera (overlay o ESC), ejecutamos el cancelCallback cuando exista
  $('#modal_confirm').modal({
    dismissible: dismissible,
    onCloseEnd: function() {
      var $modal = $('#modal_confirm');
      var cancelCb = $modal.data('confirmCancelCallback');
      if (cancelCb && typeof cancelCb === 'function') {
        // limpiamos los datos antes de ejecutar para evitar dobles llamadas
        $modal.removeData('confirmCancelCallback');
        $modal.removeData('confirmCallback');
        cancelCb();
        return;
      }
      // limpieza por defecto
      $modal.removeData('confirmCallback');
      $modal.removeData('confirmCancelCallback');
    }
  });
  $('#modal_confirm').modal('open');
}

// Modal que solicita inputs al usuario y devuelve los valores en el callback
// modalInput(title, htmlForm, dismiss, acceptText, cancelText, acceptIcon, cancelIcon, acceptCallback, cancelCallback)
function modalInput(title, htmlForm, dismiss, acceptText, cancelText, acceptIcon, cancelIcon, acceptCallback, cancelCallback){
  var dismissible = (typeof dismiss === 'boolean') ? dismiss : false;
  $('#confirm-title').text(title);
  // insertar HTML del formulario dentro del modal (usar html para permitir inputs)
  $('#confirm-message').html(htmlForm);

  // textos por defecto
  var acceptBtnText = (typeof acceptText === 'string' && acceptText.length>0) ? acceptText : 'Aceptar';
  var cancelBtnText = (typeof cancelText === 'string' && cancelText.length>0) ? cancelText : 'Cancelar';

  if ($('#save_confirm').length) {
    $('#save_confirm').html('<i class="material-icons left">' + (acceptIcon || 'check') + '</i>' + acceptBtnText);
  }
  if ($('#save_cancel').length) {
    $('#save_cancel').html('<i class="material-icons left">' + (cancelIcon || 'clear') + '</i>' + cancelBtnText);
  }

  // helper para leer valores de inputs dentro del modal
  function collectInputs($modal){
    var vals = {};
    $modal.find('input,select,textarea').each(function(){
      var $el = $(this);
      var key = $el.attr('name') || $el.attr('id');
      if(!key) return;
      if($el.is(':checkbox')){
        vals[key] = $el.is(':checked') ? 1 : 0;
      }else if($el.is(':radio')){
        if($el.is(':checked')) vals[key] = $el.val();
      }else{
        vals[key] = $el.val();
      }
    });
    return vals;
  }

  // guardar callbacks envueltos para que el handler existente (save_confirm/save_cancel) los ejecute
  if (typeof acceptCallback === 'function'){
    $('#modal_confirm').data('confirmCallback', function(){
      var vals = collectInputs($('#modal_confirm'));
      acceptCallback(vals);
    });
  }else{
    $('#modal_confirm').removeData('confirmCallback');
  }
  if (typeof cancelCallback === 'function'){
    $('#modal_confirm').data('confirmCancelCallback', function(){
      cancelCallback();
    });
  }else{
    $('#modal_confirm').removeData('confirmCancelCallback');
  }

  // abrir modal reutilizando la misma lógica de modalConfirm
  $('#modal_confirm').modal({
    dismissible: dismissible,
    onCloseEnd: function(){
      var $modal = $('#modal_confirm');
      var cancelCb = $modal.data('confirmCancelCallback');
      if (cancelCb && typeof cancelCb === 'function'){
        $modal.removeData('confirmCancelCallback');
        $modal.removeData('confirmCallback');
        cancelCb();
        return;
      }
      $modal.removeData('confirmCallback');
      $modal.removeData('confirmCancelCallback');
    }
  });
  $('#modal_confirm').modal('open');
}

// Handlers globales para modal de confirmación
$(document).on('click', '#save_confirm', function(e){
  e.preventDefault();
  var $modal = $('#modal_confirm');
  var cb = $modal.data('confirmCallback');
  if(cb && typeof cb === 'function'){
    $modal.modal('close');
    $modal.removeData('confirmCallback');
    $modal.removeData('confirmCancelCallback');
    cb();
    return;
  }
  // si no hay callback, solo cerramos y limpiamos
  $modal.modal('close');
  $modal.removeData('confirmCallback');
  $modal.removeData('confirmCancelCallback');
});

$(document).on('click', '#save_cancel', function(e){
  e.preventDefault();
  var $modal = $('#modal_confirm');
  var cancelCb = $modal.data('confirmCancelCallback');
  $modal.modal('close');
  if(cancelCb && typeof cancelCb === 'function'){
    $modal.removeData('confirmCancelCallback');
    $modal.removeData('confirmCallback');
    cancelCb();
    return;
  }
  // limpiar si no hay callback
  $modal.removeData('confirmCallback');
  $modal.removeData('confirmCancelCallback');
});

// Handler para el botón del modal de error
$(document).on('click', '#error_confirm', function(e){
  e.preventDefault();
  var $modal = $('#modal_error');
  var cb = $modal.data('errorCallback');
  $modal.modal('close');
  if(cb && typeof cb === 'function'){
    $modal.removeData('errorCallback');
    cb();
    return;
  }
  $modal.removeData('errorCallback');
});

// ordenar resultados
function comparer(index) {
  return function(a, b) {
    var valA = getCellValue(a, index), valB = getCellValue(b, index);
    return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB);
  };
}

function getCellValue(row, index){ return $(row).children("td").eq(index).text(); }

// Cargar nombre de usuario en el menú superior
function loadUserMenu(){
  try{
    jQuery.post('services/current_user.php')
      .done(function(resp){
        try{
          var data = (typeof resp === 'string') ? JSON.parse(resp) : resp;
          if(data && data.resultados && data.resultados.length>0){
            var item = data.resultados[0];
            var display = item.name || item.user || '';
            jQuery('#user_menu_nav').text(display);
          }
        }catch(e){ console.warn('Error parseando usuario', e); }
      })
      .fail(function(){ console.warn('No se pudo cargar usuario'); });
  }catch(e){ console.warn('loadUserMenu error', e); }
}

// Menú contextual en el elemento #nav_account: opciones rápidas (Cerrar sesión)
jQuery(document).on('click', '#nav_account', function(e){
  e.preventDefault();
  jQuery('.row-menu').remove();

  var $btn = jQuery(this);
  var offset = $btn.offset();
  var menu = jQuery("<div class='row-menu'><ul><li class='row-menu-logout'>Cerrar sesión</li><li class='row-menu-config'>Administración</li><li class='row-menu-cancel'>Cancelar</li></ul></div>");

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

  menu.on('click', '.row-menu-logout', function(ev){
    ev.stopPropagation();
    // llamar al endpoint para terminar sesión
    jQuery.post('services/end_session.php')
      .done(function(resp){
        if($.trim(resp) === 'OK'){
          window.location.href = 'login.html';
        } else {
          modalError('Error','Error cerrando sesión: ' + resp, false);
        }
      })
      .fail(function(){
        modalError('Error','Error de red al intentar cerrar sesión', false);
      })
      .always(function(){ menu.remove(); });
  });

  menu.on('click', '.row-menu-config', function(ev){
    ev.stopPropagation();
    window.open('admin.html', '_blank');
    menu.remove();
  });

  menu.on('click', '.row-menu-cancel', function(ev){ ev.stopPropagation(); menu.remove(); });

  setTimeout(function(){
    jQuery(document).on('click.rowMenuCloseNav', function(ev){
      if(jQuery(ev.target).closest('.row-menu').length===0 && jQuery(ev.target).closest('#nav_account').length===0){
        jQuery('.row-menu').remove();
        jQuery(document).off('click.rowMenuCloseNav');
      }
    });
  }, 10);
});
