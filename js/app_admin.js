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
    

});

// Simple tab switching (moved from admin.html)
document.querySelectorAll('#nav-desktop-adm li a').forEach(function(a){
  a.addEventListener('click', function(e){
    e.preventDefault();
    var target = this.getAttribute('href').substring(1);
    document.querySelectorAll('.tab-content').forEach(function(c){ c.style.display = 'none'; });
    var el = document.getElementById(target);
    if(el) el.style.display = '';
    document.querySelectorAll('#nav-desktop-adm li').forEach(function(li){ li.classList.remove('active'); });
    this.parentElement.classList.add('active');
    document.getElementById('title_nav').textContent = target;
  });
});

// Funciones de modal copiadas desde app.js para la versión admin
// Función global para mostrar modal de error
// Nueva firma: modalError(title, message, dismiss, btnText, btnIcon, successCallback)
function modalError(title, message, dismiss, btnText, btnIcon, successCallback) {
  var dismissible = (typeof dismiss === 'boolean') ? dismiss : false;
  $('#error-title').text(title);
  $('#error-message').html(message);

  var btnTextFinal = (typeof btnText === 'string' && btnText.length>0) ? btnText : 'Aceptar';
  var btnIconFinal = (typeof btnIcon === 'string' && btnIcon.length>0) ? btnIcon : 'check';

  if ($('#error_confirm').length) {
    $('#error_confirm').html('<i class="material-icons left">' + btnIconFinal + '</i>' + btnTextFinal);
  }

  if (typeof successCallback === 'function') {
    $('#modal_error').data('errorCallback', successCallback);
  } else {
    $('#modal_error').removeData('errorCallback');
  }

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
function modalConfirm(title, message, dismiss, confirmText, cancelText, confirmIcon, cancelIcon, confirmCallback, cancelCallback) {
  var dismissible = (typeof dismiss === 'boolean') ? dismiss : false;
  $('#confirm-title').text(title);
  $('#confirm-message').text(message);

  var confirmBtnText = (typeof confirmText === 'string' && confirmText.length>0) ? confirmText : 'Aceptar';
  var cancelBtnText = (typeof cancelText === 'string' && cancelText.length>0) ? cancelText : 'Cancelar';

  if ($('#save_confirm').length) {
    $('#save_confirm').html('<i class="material-icons left">' + (confirmIcon || 'check') + '</i>' + confirmBtnText);
  }
  if ($('#save_cancel').length) {
    $('#save_cancel').html('<i class="material-icons left">' + (cancelIcon || 'clear') + '</i>' + cancelBtnText);
  }

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

  $('#modal_confirm').modal({
    dismissible: dismissible,
    onCloseEnd: function() {
      var $modal = $('#modal_confirm');
      var cancelCb = $modal.data('confirmCancelCallback');
      if (cancelCb && typeof cancelCb === 'function') {
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

// Modal que solicita inputs al usuario y devuelve los valores en el callback
// modalInput(title, htmlForm, dismiss, acceptText, cancelText, acceptIcon, cancelIcon, acceptCallback, cancelCallback)
function modalInput(title, htmlForm, dismiss, acceptText, cancelText, acceptIcon, cancelIcon, acceptCallback, cancelCallback){
  var dismissible = (typeof dismiss === 'boolean') ? dismiss : false;
  $('#confirm-title').text(title);
  $('#confirm-message').html(htmlForm);

  var acceptBtnText = (typeof acceptText === 'string' && acceptText.length>0) ? acceptText : 'Aceptar';
  var cancelBtnText = (typeof cancelText === 'string' && cancelText.length>0) ? cancelText : 'Cancelar';

  if ($('#save_confirm').length) {
    $('#save_confirm').html('<i class="material-icons left">' + (acceptIcon || 'check') + '</i>' + acceptBtnText);
  }
  if ($('#save_cancel').length) {
    $('#save_cancel').html('<i class="material-icons left">' + (cancelIcon || 'clear') + '</i>' + cancelBtnText);
  }

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

	// funcion de abrir popups en funcion de la seccion y formulario (también recibe el id)
	window.openModal = function(seccion, cual, id){
		$("#modal_"+seccion).find(".modal_txt_title").empty();
		$("#modal_"+seccion).find(".modal_txt_btn_left").empty();
		$("#modal_"+seccion).find(".modal_txt_btn_right").empty();
    if(seccion=="usu") openUsuario(seccion, cual, id);
    if(seccion=="equ") openEquipo(seccion, cual, id);
    if(seccion=="camp") openCampo(seccion, cual, id);
	}

function getCellValue(row, index){ return $(row).children("td").eq(index).text(); }
