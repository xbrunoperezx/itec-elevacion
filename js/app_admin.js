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
