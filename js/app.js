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

	// funcion de abrir popups en funcion de la seccion y formulario (también recibe el id)
	var openModal = function(seccion, cual, id){
		$("#modal_"+seccion).find(".modal_txt_title").empty();
		$("#modal_"+seccion).find(".modal_txt_btn_left").empty();
		$("#modal_"+seccion).find(".modal_txt_btn_right").empty();
		if(seccion=="cli"){
			openCliente(seccion, cual, id);
		}
		if(seccion=="con"){
			openContratada(seccion, cual, id);
		}
	}

	// Click en los elementos del menú superior
	jQuery(document).on('click', 'nav li', function(e) {
		jQuery('nav li').removeClass('active');
		jQuery(this).addClass('active');
	});

	// Escuchar el evento de click en los elementos del menú
	jQuery(document).on('click', '#nav-mobile li', function() {
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
	$('#nav-mobile li:first').click();

	// Botones de ocultar los filtros
	$("#btnToggle_cli").click(function(){
  	$("#sectionToggle_cli").toggle();
  });
  $("#btnToggle_con").click(function(){
  	$("#sectionToggle_con").toggle();
  });
  
}); // end jQuery ready

// ordenar resultados
function comparer(index) {
  return function(a, b) {
    var valA = getCellValue(a, index), valB = getCellValue(b, index);
    return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB);
  };
}

function getCellValue(row, index){ return $(row).children("td").eq(index).text(); }
