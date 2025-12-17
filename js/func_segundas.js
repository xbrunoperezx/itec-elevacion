// Funciones relacionadas con la pestaña de informes
var readSegundas = function(id, totalParams){

	var hoy = new Date();
	var y = hoy.getFullYear();
	var m = hoy.getMonth() + 1;
	var d = hoy.getDate();
	var hace1mes = new Date(y, m, d);
	var y1 = hace1mes.getFullYear();
	var m1 = hace1mes.getMonth() + 1;
	var d1 = hace1mes.getDate();
	var hace2meses = new Date(y, m + 1, d);
	var y2 = hace2meses.getFullYear();
	var m2 = hace2meses.getMonth() + 1;
	var d2 = hace2meses.getDate();
	if (m < 10) {
	  m = "0" + m;
	}
	if (d < 10) {
	  d = "0" + d;
	}
	var fechaHoy = y +""+ m +""+ d;
	if (m1 < 10) {
	  m1 = "0" + m1;
	}
	if (d1 < 10) {
	  d1 = "0" + d1;
	}
	var fechaHace1Mes = y1 +""+ m1+"" + d1;
	if (m2 < 10) {
	  m2 = "0" + m2;
	}
	if (d2 < 10) {
	  d2 = "0" + d2;
	}
	var fechaHace2Meses = y2 +""+ m2+"" + d2;

	// limpiamos la tabla de contratadas
	$("#table_seg tbody").empty();
	// Realizar la petición HTTP a la API
	$.ajax({
		url: 'services/segundas.php',
		type: 'POST',
		data: totalParams,
		success: function(data) {
		    // Recorrer los datos devueltos por la consulta
		    datos = JSON.parse(data)["resultados"];
		    dataLayer.push({
		    	"event" : "service",
		    	"type" : "list_seg",
		    	"data" : datos
		    });
		    if(datos.length==0){
				// Crear la fila que muestra el total de resultados
				var totalRow = "<span class='main-text'>Total de resultados:</span> <span class='secondary-text'>0, no hay resultados para la búsqueda realizada!!</span>";
				// Agregar la fila a la tabla
				$("#resultados_seg").html(totalRow);
			    $('#app-content > div#loading').hide();
				$('#app-content div#tab_'+id).show();
		    }else{
				var totalResultados = 0;
			    $.each(datos, function(index, item) {
				    // Construir la fila de la tabla con los datos
				    var tableRow = "<tr";
			      	var rango = "";
					if(item.informe.segunda["2resultado"] == 0){
						console.log("inspección sin hacer!");
						var fechaProxima = item.informe.primera["proxima"].replace(/\-/g,"");
						console.log(fechaProxima);
						console.log(fechaHace2Meses);
						console.log(fechaHace1Mes);
						if(fechaProxima <= fechaHace2Meses && fechaProxima > fechaHace1Mes){
							rango = 1;
							console.log("rango: "+rango);
							tableRow+=" class='green lighten-3'";
						}else if(fechaProxima <= fechaHace1Mes && fechaProxima > fechaHoy){
							rango = 2;
							console.log("rango: "+rango);
							tableRow+=" class='orange lighten-3'";
						}else if(fechaProxima <= fechaHoy){
							rango = 3;
							console.log("rango: "+rango);
							tableRow+=" class='red lighten-3'";
						}
					}
			      	tableRow+=">" +
			        "<td class='ancho50'>&nbsp;</td>" + 
			        "<td class='ancho50'>" + item.informe.segunda["2fecha_y"] + "</td>" + 
			        "<td class='ancho100'>" + item.contratada.informe + "-2</td>" +
			        "<td class='ancho75'>" + item.cliente.rae + "</td>" + 
			        "<td class='ancho50'>" +
			          "<a seccion='pri' tipo='frm_editpri' data-id='" + item.informe.id + "' class='editar_seg btn-floating btn-small waves-effect waves-light green' title='Editar informe'>" +
			            "<i class='material-icons'>edit</i>" +
			          "</a>" +
			        "</td>" +
			        "<td><span class='main-text'>" + item.cliente.nombre + "</span><br><span class='secondary-text'>" + item.cliente.direccion + " ( " + item.cliente.cp + " - " + item.cliente.localidad + " )</span></td>" +
			        "<td class='ancho200'>" + item.cliente.mantenedor + "</td>" +
			        "<td class='ancho50'>";
					if(item.informe.segunda["2resultado"]==0){
			        	if(rango=="") tableRow+="<a class='disabled btn-floating btn-small waves-effect waves-light red lighten-3' title='Vencimiento dentro de plazo'><i class='material-icons'>warning</i></a>";
			        	if(rango==1) tableRow+="<a class='btn-floating btn-small waves-effect waves-light green' title='<2 mes para realizar la inspeccion'><i class='material-icons'>warning</i></a>";
			        	if(rango==2) tableRow+="<a class='btn-floating btn-small waves-effect waves-light orange' title='<1 mes para realizar la inspeccion'><i class='material-icons'>warning</i></a>";
			        	if(rango==3) tableRow+="<a class='btn-floating btn-small waves-effect waves-light red' title='Inspeccion caducada!!'><i class='material-icons'>warning</i></a>";
			        }else{
						tableRow+="&nbsp;";
					}
			        tableRow+= "</td>" +			        
			        "<td class='ancho150'>" + item.informe.primera["proxima_dmy"] + "</td>" +
			        "<td class='ancho100'>";

			        // Icono localización Google Maps
			        if(item.informe.segunda["2latitud"] != "" && item.informe.segunda["2longitud"] != ""){
						tableRow += "<a class='btn-floating btn-small waves-effect waves-light blue' title='Ver en Google Maps\nLat: " + item.informe.segunda["2latitud"] + "\nLon: "+item.informe.segunda["2longitud"] + "' href='http://maps.google.com/?q=" + item.informe.segunda["2latitud"] + ","+item.informe.segunda["2longitud"] + "' target='_blank'><i class='material-icons'>gps_fixed</i></a>";
			        }else{
			        	tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light blue disabled' title='Ver en Google Maps'><i class='material-icons'>gps_fixed</i></a>";
			        }	

			        tableRow += "&nbsp;";

			        // Icono hora
			        if(item.informe.segunda["2hora_ini"] != "" && item.informe.segunda["2hora_fin"] != ""){
						tableRow += "<a class='btn-floating btn-small waves-effect waves-light green' title='Hora inicio: "+item.informe.segunda["2hora_ini"]+"h\nHora fin: "+item.informe.segunda["2hora_fin"]+"h'><i class='material-icons'>access_time</i></a>";
			        }
			        if(item.informe.segunda["2hora_ini"] != "" && item.informe.segunda["2hora_fin"] == ""){
			        	tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Hora inicio: "+item.informe.segunda["2hora_ini"]+"h\n¡Inspección en curso!'><i class='material-icons'>access_time</i></a>";
			        }	
			        if(item.informe.segunda["2hora_ini"] == "" && item.informe.segunda["2hora_fin"] == ""){
			        	tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light red' title='Sin comenzar...'><i class='material-icons'>access_time</i></a>";
			        }	        
			        tableRow += "</td>" + 
			        "<td class='ancho150'>" + item.informe.segunda["2fecha_dmy"] + "</td>" +
			        "<td class='ancho100'>" +
			          "<a class='btn-floating btn-small waves-effect waves-light grey' title='Inspector: " + item.informe.segunda["2usuario"] + "'>" +
			            item.informe.segunda["2usuario_ab"] +
			          "</a>&nbsp;" +
			          "<a class='btn-floating btn-small waves-effect waves-light ";
			            if(item.informe.segunda["2resultado_f"]=="-") tableRow += "grey disabled' title='Sin hacer'>";
			            if(item.informe.segunda["2resultado_f"]=="F") tableRow += "green' title='Favorable'>";
			            if(item.informe.segunda["2resultado_f"]=="FL") tableRow += "green' title='Favorable (defectos leves)'>";
			            if(item.informe.segunda["2resultado_f"]=="DG") tableRow += "red' title='Desfavorable (defectos graves)'>";
			            if(item.informe.segunda["2resultado_f"]=="DM") tableRow += "red' title='Desfavorable (defectos muy graves)'>";
			          tableRow += item.informe.segunda["2resultado_f"] +"</a>" +
	 				"</td>" +
			        "<td class='ancho150'>" + item.informe.segunda["2industria_dmy"] + "</td>" +
			        "<td class='ancho150'>";
			        if(item.informe.segunda["2resultado"]>0){	
			        	tableRow += "<a seccion='pri' tipo='sheet_seg' data-id='" + item.informe.id + "' class='sheet_seg btn-floating btn-small waves-effect waves-light grey darken-1' title='Hoja de campo'>" +
			            	"<i class='material-icons'>assignment</i>" +
			          	"</a>&nbsp;" +
			          	"<a seccion='pri' tipo='print_seg' data-id='" + item.informe.id + "' class='print_seg btn-floating btn-small waves-effect waves-light light-blue darken-2' title='Generar informe'>" +
			            	"<i class='material-icons'>picture_as_pdf</i>" +
			          	"</a>";
			        }else{
			        	tableRow += "<a seccion='pri' tipo='sheet_seg' data-id='" + item.informe.id + "' class='disabled sheet_seg btn-floating btn-small waves-effect waves-light grey darken-1' title='Hoja de campo'>" +
			            	"<i class='material-icons'>assignment</i>" +
			          	"</a>&nbsp;" +
			          	"<a seccion='pri' tipo='print_seg' data-id='" + item.informe.id + "' class='disabled print_seg btn-floating btn-small waves-effect waves-light light-blue darken-2' title='Generar informe'>" +
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
			      $("#table_seg").append(tableRow);
			      totalResultados++;
			    });

			    // Crear la fila que muestra el total de resultados
				var totalRow = "<span class='main-text'>Total de resultados:</span> <span class='secondary-text'>" + totalResultados + "</span>";
				// Agregar la fila a la tabla
				$("#resultados_seg").html(totalRow);
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
jQuery(document).on("keypress", "#tab_seg [id*=filtro_seg]", function(){
	jQuery("#filtrar_seg_clear").removeClass("hide");
});

jQuery(document).on("click", "#filtrar_seg", function() {
  var total = jQuery(this).parents("#tab_seg").find("#filtro_seg_total").val();
  if((parseInt(total)>=1)){
	  var nombre = jQuery(this).parents("#tab_seg").find("#filtro_seg_nombre").val();
	  var direccion = jQuery(this).parents("#tab_seg").find("#filtro_seg_direccion").val();
	  var localidad = jQuery(this).parents("#tab_seg").find("#filtro_seg_localidad").val();
	  var rae = jQuery(this).parents("#tab_seg").find("#filtro_seg_rae").val();
	  var fechaini = jQuery(this).parents("#tab_seg").find("#filtro_seg_fechainicio").val();
	  var fechafin = jQuery(this).parents("#tab_seg").find("#filtro_seg_fechafin").val();
	  var pendientes = jQuery(this).parents("#tab_seg").find("#filtro_seg_pendiente").is(":checked");
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
	  var tipo = "seg";
		readSegundas(tipo, filtros);
  }else{
  	$("#error-title").text("ERROR");
  	$("#error-message").text("Hay que introducir un número mínimo de resultados esperados! Para ello introduce un valor en el campo registros, dentro del módulo de filtros.");
  	$("#modal_error").modal("open");	
  }
});

// Limpiar filtros de contratadas
jQuery(document).on("click", "#filtrar_seg_clear", function() {
	jQuery(this).addClass("hide");
	jQuery(this).parents("#tab_seg").find("#filtro_seg_nombre").val('');
	jQuery(this).parents("#tab_seg").find("#filtro_seg_direccion").val('');
	jQuery(this).parents("#tab_seg").find("#filtro_seg_localidad").val('');
	jQuery(this).parents("#tab_seg").find("#filtro_seg_rae").val('');	
	jQuery(this).parents("#tab_seg").find("#filtro_seg_fechainicio").val('');	
	jQuery(this).parents("#tab_seg").find("#filtro_seg_fechafin").val('');	
	jQuery(this).parents("#tab_seg").find("label").not(":eq(0)").removeClass("active");
	jQuery(this).parents("#tab_seg").find("#filtro_seg_total").val('15');	
	jQuery(this).parents("#tab_seg").find("#filtro_seg_pendiente").prop("checked", false);
	jQuery(this).parents("#tab_seg").find("#filtrar_seg").click();
});