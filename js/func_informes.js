// Funciones relacionadas con la pestaña de informes
var readInformes = function(id, totalParams){
	// limpiamos la tabla de contratadas
	$("#table_pri tbody").empty();
	// Realizar la petición HTTP a la API
	$.ajax({
		url: 'services/primeras.php',
		type: 'POST',
		data: totalParams,
		success: function(data) {
		    // Recorrer los datos devueltos por la consulta
		    datos = JSON.parse(data)["resultados"];
		    dataLayer.push({
		    	"event" : "service",
		    	"type" : "list_pri",
		    	"data" : datos
		    });
		    if(datos.length==0){
				// Crear la fila que muestra el total de resultados
				var totalRow = "<span class='main-text'>Total de resultados:</span> <span class='secondary-text'>0, no hay resultados para la búsqueda realizada!!</span>";
				// Agregar la fila a la tabla
				$("#resultados_pri").html(totalRow);
			    $('#app-content > div#loading').hide();
				$('#app-content div#tab_'+id).show();
		    }else{
				var totalResultados = 0;
			    $.each(datos, function(index, item) {
			      // Construir la fila de la tabla con los datos
			      var tableRow = "<tr>" +
			        "<td class='ancho50'>&nbsp;</td>" + 
			        "<td class='ancho50'>" + item.informe.primera.fecha_y + "</td>" + 
			        "<td class='ancho75'>" + item.contratada.informe + "</td>" +
			        "<td class='ancho75'>" + item.cliente.rae + "</td>" + 
			        "<td class='ancho50'>" +
			          "<a seccion='pri' tipo='frm_editpri' data-id='" + item.informe.id + "' class='editar_pri btn-floating btn-small waves-effect waves-light green' title='Editar informe'>" +
			            "<i class='material-icons'>edit</i>" +
			          "</a>" +
			        "</td>" +
			        "<td><span class='main-text'>" + item.cliente.nombre + "</span><br><span class='secondary-text'>" + item.cliente.direccion + " ( " + item.cliente.cp + " - " + item.cliente.localidad + " )</span></td>" +
			        "<td class='ancho200'>" + item.cliente.mantenedor + "</td>" +
			        "<td class='ancho150'>";

			        // Icono comunicada
			        if(item.contratada.comunicada_dmy != "-"){
						tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Comunicada el día " + 
						item.contratada.comunicada_dmy + " a " + item.contratada.comunicada_aquien + ", " + item.contratada.comunicada_como + 
						"'><i class='material-icons'>comment</i></a>";
			        }else{
			        	tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light orange disabled' title=''><i class='material-icons'>comment</i></a>";
			        }

			        tableRow += "&nbsp;";

			        // Icono localización Google Maps
			        if(item.informe.primera.latitud != "" && item.informe.primera.longitud != ""){
						tableRow += "<a class='btn-floating btn-small waves-effect waves-light blue' title='Ver en Google Maps\nLat: " + item.informe.primera.latitud + "\nLon: "+item.informe.primera.longitud + "' href='http://maps.google.com/?q=" + item.informe.primera.latitud + ","+item.informe.primera.longitud + "' target='_blank'><i class='material-icons'>gps_fixed</i></a>";
			        }else{
			        	tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light blue disabled' title='Ver en Google Maps'><i class='material-icons'>gps_fixed</i></a>";
			        }	

			        tableRow += "&nbsp;";

			        // Icono hora
			        if(item.informe.primera.hora_ini != "" && item.informe.primera.hora_fin != ""){
						tableRow += "<a class='btn-floating btn-small waves-effect waves-light green' title='Hora inicio: "+item.informe.primera.hora_ini+"h\nHora fin: "+item.informe.primera.hora_fin+"h'><i class='material-icons'>access_time</i></a>";
			        }
			        if(item.informe.primera.hora_ini != "" && item.informe.primera.hora_fin == ""){
			        	tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Hora inicio: "+item.informe.primera.hora_ini+"h\n¡Inspección en curso!'><i class='material-icons'>access_time</i></a>";
			        }	
			        if(item.informe.primera.hora_ini == "" && item.informe.primera.hora_fin == ""){
			        	tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light red' title='Sin comenzar...'><i class='material-icons'>access_time</i></a>";
			        }	        
			        tableRow += "</td>" + 
			        "<td class='ancho150'>" + item.informe.primera.fecha_dmy + "</td>" +
			        "<td class='ancho100'>" +
			          "<a class='btn-floating btn-small waves-effect waves-light grey' title='Inspector: " + item.informe.primera.usuario + "'>" +
			            item.informe.primera.usuario_ab +
			          "</a>&nbsp;" +
			          "<a class='btn-floating btn-small waves-effect waves-light ";
			            if(item.informe.primera.resultado_f=="-") tableRow += "grey disabled' title='Sin hacer'>";
			            if(item.informe.primera.resultado_f=="F") tableRow += "green' title='Favorable'>";
			            if(item.informe.primera.resultado_f=="FL") tableRow += "green' title='Favorable (defectos leves)'>";
			            if(item.informe.primera.resultado_f=="DG") tableRow += "red' title='Desfavorable (defectos graves)'>";
			            if(item.informe.primera.resultado_f=="DM") tableRow += "red' title='Desfavorable (defectos muy graves)'>";
			          tableRow += item.informe.primera.resultado_f +"</a>" +
	 				"</td>" +
			        "<td class='ancho150'>" + item.informe.primera.industria_dmy + "</td>" +
			        "<td class='ancho150'>";
			        if(item.informe.primera.resultado>0){	
			        	tableRow += "<a seccion='pri' tipo='sheet_pri' data-id='" + item.informe.id + "' class='sheet_pri btn-floating btn-small waves-effect waves-light grey darken-1' title='Hoja de campo'>" +
			            	"<i class='material-icons'>assignment</i>" +
			          	"</a>&nbsp;" +
			          	"<a seccion='pri' tipo='print_pri' data-id='" + item.informe.id + "' class='print_pri btn-floating btn-small waves-effect waves-light light-blue darken-2' title='Generar informe'>" +
			            	"<i class='material-icons'>picture_as_pdf</i>" +
			          	"</a>";
			        }else{
			        	tableRow += "<a seccion='pri' tipo='sheet_pri' data-id='" + item.informe.id + "' class='disabled sheet_pri btn-floating btn-small waves-effect waves-light grey darken-1' title='Hoja de campo'>" +
			            	"<i class='material-icons'>assignment</i>" +
			          	"</a>&nbsp;" +
			          	"<a seccion='pri' tipo='print_pri' data-id='" + item.informe.id + "' class='disabled print_pri btn-floating btn-small waves-effect waves-light light-blue darken-2' title='Generar informe'>" +
			            	"<i class='material-icons'>picture_as_pdf</i>" +
			          	"</a>";		        	
			        }
			        
			        tableRow += "</td>" +
					"<td class='ancho50'>" +
			          	"<a class='btn-floating btn-small waves-effect waves-light red' title='Más'>" +
			            	"<i class='material-icons'>more_vert</i>" +
			          	"</a>" +
			        "</td>" +
			      "</tr>";

			      // Agregar la fila a la tabla
			      $("#table_pri").append(tableRow);
			      totalResultados++;
			    });

			    // Crear la fila que muestra el total de resultados
				var totalRow = "<span class='main-text'>Total de resultados:</span> <span class='secondary-text'>" + totalResultados + "</span>";
				// Agregar la fila a la tabla
				$("#resultados_pri").html(totalRow);
			    $('#app-content > div#loading').hide();
				$('#app-content div#tab_'+id).show();
		    }
		},
		error: function(xhr, status, error) {
			// Mostrar un mensaje de error en el centro de la pantalla
			$('#app-content div#error').html(error);
			$('#app-content div#error').show();
		}
	});
}


// Filtros de informe
jQuery(document).on("keypress", "#tab_pri [id*=filtro_pri]", function(){
	jQuery("#filtrar_pri_clear").removeClass("hide");
});

jQuery(document).on("click", "#filtrar_pri", function() {
  var total = jQuery(this).parents("#tab_pri").find("#filtro_pri_total").val();
  if((parseInt(total)>=1)){
	  var nombre = jQuery(this).parents("#tab_pri").find("#filtro_pri_nombre").val();
	  var direccion = jQuery(this).parents("#tab_pri").find("#filtro_pri_direccion").val();
	  var localidad = jQuery(this).parents("#tab_pri").find("#filtro_pri_localidad").val();
	  var rae = jQuery(this).parents("#tab_pri").find("#filtro_pri_rae").val();
	  var fechaini = jQuery(this).parents("#tab_pri").find("#filtro_pri_fechainicio").val();
	  var fechafin = jQuery(this).parents("#tab_pri").find("#filtro_pri_fechafin").val();
 	  var pendientes = jQuery(this).parents("#tab_pri").find("#filtro_pri_pendiente").is(":checked");
	  var filtros = {
	  	filtro_total : total,
	  	filtro_nombre : nombre,
	  	filtro_direccion : direccion,
	  	filtro_localidad : localidad,
			filtro_rae : rae,
			filtro_fecha_inicio : fechaini,
			filtro_fecha_fin : fechafin,
			filtro_pendientes: pendientes
	  };
	  var tipo = "pri";
		readInformes(tipo, filtros);
  }else{
  	$("#error-title").text("ERROR");
  	$("#error-message").text("Hay que introducir un número mínimo de resultados esperados! Para ello introduce un valor en el campo registros, dentro del módulo de filtros.");
  	$("#modal_error").modal("open");	
  }
});

// Limpiar filtros de contratadas
jQuery(document).on("click", "#filtrar_pri_clear", function() {
	jQuery(this).addClass("hide");
	jQuery(this).parents("#tab_pri").find("#filtro_pri_nombre").val('');
	jQuery(this).parents("#tab_pri").find("#filtro_pri_direccion").val('');
	jQuery(this).parents("#tab_pri").find("#filtro_pri_localidad").val('');
	jQuery(this).parents("#tab_pri").find("#filtro_pri_rae").val('');	
	jQuery(this).parents("#tab_pri").find("#filtro_pri_fechainicio").val('');	
	jQuery(this).parents("#tab_pri").find("#filtro_pri_fechafin").val('');	
	jQuery(this).parents("#tab_pri").find("label").not(":eq(0)").removeClass("active");
	jQuery(this).parents("#tab_pri").find("#filtro_pri_total").val('15');	
	jQuery(this).parents("#tab_pri").find("#filtro_pri_pendiente").prop("checked", false);
	jQuery(this).parents("#tab_pri").find("#filtrar_pri").click();
});