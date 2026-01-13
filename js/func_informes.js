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
			var totalResultados = 0;
			$.each(datos, function(index, item) {
				// Construir la fila de la tabla con los datos
				var tableRow = "<tr>" +
				"<td class='ancho50'>&nbsp;</td>" + 
				"<td class='ancho50'>" + item.fecha_y + "</td>" + 
				"<td class='ancho100'>" + item.informe + "</td>" +
				"<td class='ancho75'>" + item.contratada.cliente.rae + "</td>" + 
				"<td class='ancho50'>" +
					"<a seccion='pri' tipo='frm_editpri' data-id='" + item.id + "' class='editar_pri btn-floating btn-small waves-effect waves-light green' title='Editar informe'>" +
					"<i class='material-icons'>edit</i>" +
					"</a>" +
				"</td>" +
				"<td><span class='main-text'>" + item.contratada.cliente.nombre + "</span><br><span class='secondary-text'>" + item.contratada.cliente.direccion + " ( " + item.contratada.cliente.cp + " - " + item.contratada.cliente.localidad + " )</span></td>" +
				"<td class='ancho200'>" + item.contratada.cliente.mantenedor + "</td>" +
				"<td class='ancho150'>";

				// Icono comunicada
				if(item.comunicada != "-"){
					tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Comunicada el día " + 
					item.comunicada + " a " + item.comunicada_aquien + ", " + item.comunicada_como + 
					"'><i class='material-icons'>comment</i></a>";
				}else{
					tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light orange disabled' title=''><i class='material-icons'>comment</i></a>";
				}

				tableRow += "&nbsp;";

				// Icono localización Google Maps
				if(item.gps_latitud != "" && item.gps_longitud != ""){
					tableRow += "<a class='btn-floating btn-small waves-effect waves-light blue' title='Ver en Google Maps\nLat: " + item.gps_latitud + "\nLon: "+item.gps_longitud + "' href='http://maps.google.com/?q=" + item.gps_latitud + ","+item.gps_longitud + "' target='_blank'><i class='material-icons'>gps_fixed</i></a>";
				}else{
					tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light blue disabled' title='Ver en Google Maps'><i class='material-icons'>gps_fixed</i></a>";
				}	

				tableRow += "&nbsp;";

				// Icono hora
				if(item.hora_ini != "" && item.hora_fin != ""){
					tableRow += "<a class='btn-floating btn-small waves-effect waves-light green' title='Hora inicio: "+item.hora_ini+"h\nHora fin: "+item.hora_fin+"h'><i class='material-icons'>access_time</i></a>";
				}
				if(item.hora_ini != "" && item.hora_fin == ""){
					tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Hora inicio: "+item.hora_ini+"h\n¡Inspección en curso!'><i class='material-icons'>access_time</i></a>";
				}	
				if(item.hora_ini == "" && item.hora_fin == ""){
					tableRow += "<a class='disabled btn-floating btn-small waves-effect waves-light red' title='Sin comenzar...'><i class='material-icons'>access_time</i></a>";
				}	        
				tableRow += "</td>" + 
				"<td class='ancho150'>" + item.fecha_dmy + "</td>" +
				"<td class='ancho100'>" +
					"<a class='btn-floating btn-small waves-effect waves-light grey' title='Inspector: " + item.usuario + "'>" + item.usuario_ab + "</a>&nbsp;" +
					"<a class='btn-floating btn-small waves-effect waves-light ";
					if(item.resultado_f=="-") tableRow += "grey disabled' title='Sin hacer'>";
					if(item.resultado_f=="F") tableRow += "green' title='Favorable'>";
					if(item.resultado_f=="FL") tableRow += "green' title='Favorable (defectos leves)'>";
					if(item.resultado_f=="DG") tableRow += "red' title='Desfavorable (defectos graves)'>";
					if(item.resultado_f=="DM") tableRow += "red' title='Desfavorable (defectos muy graves)'>";
					tableRow += item.resultado_f +"</a>" +
				"</td>" +
				"<td class='ancho150'>" + item.industria_dmy + "</td>" +
				"<td class='ancho150'>";
				if(item.resultado>0){	
					if(item.enviada_cliente!=null && item.enviada_cliente!=""){
						tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange' title='Enviada al cliente el día " + item.enviada_cliente_dmy + "'><i class='material-icons'>send</i></a>&nbsp;";
					}else{
						tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange disabled' title='Pendiente de envío al cliente'><i class='material-icons'>send</i></a>&nbsp;";
					}
					tableRow += "<a seccion='pri' tipo='sheet_pri' data-id='" + item.id + "' class='sheet_pri btn-floating btn-small waves-effect waves-light grey darken-1' title='Hoja de campo'>" +
						"<i class='material-icons'>assignment</i>" +
					"</a>&nbsp;" +
					"<a seccion='pri' tipo='print_pri' data-id='" + item.id + "' class='print_pri btn-floating btn-small waves-effect waves-light light-blue darken-2' title='Generar informe'>" +
						"<i class='material-icons'>picture_as_pdf</i>" +
					"</a>";
				}else{
					tableRow += "<a class='btn-floating btn-small waves-effect waves-light orange disabled' title='Pendiente de envío al cliente'>" +
						"<i class='material-icons'>send</i>" +
					"</a>&nbsp;";
					tableRow += "<a seccion='pri' tipo='sheet_pri' data-id='" + item.id + "' class='disabled sheet_pri btn-floating btn-small waves-effect waves-light grey darken-1' title='Hoja de campo'>" +
						"<i class='material-icons'>assignment</i>" +
					"</a>&nbsp;" +
					"<a seccion='pri' tipo='print_pri' data-id='" + item.id + "' class='disabled print_pri btn-floating btn-small waves-effect waves-light light-blue darken-2' title='Generar informe'>" +
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
		},
		error: function(xhr, status, error) {
			// Mostrar un mensaje de error en el centro de la pantalla
			$('#app-content div#error').html(error);
			$('#app-content div#error').show();
		}
	});
}


// Filtros de informe
jQuery(document).on("keydown", "#tab_pri [id*=filtro_pri]", function(e){
	// Mostrar botón limpiar cuando se escribe
	jQuery("#filtrar_pri_clear").removeClass("hide");
	// Si se pulsa Enter, ejecutar búsqueda
	if (e.key === 'Enter' || e.which === 13 || e.keyCode === 13) {
		e.preventDefault();
		jQuery(this).parents("#tab_pri").find("#filtrar_pri").click();
	}
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
    modalError("ERROR","Hay que introducir un número mínimo de resultados esperados! Para ello introduce un valor en el campo registros, dentro del módulo de filtros.", false);
  }
});

var openInforme = function(seccion, cual, id){
	if(cual=="frm_editpri"){
		// Realizar la petición HTTP a la API
		var totalParams = {
			filtro_id : id
		}
		$.ajax({
			url: 'services/primeras.php',
			type: 'POST',
			data: totalParams,
			success: function(data) {
				// Recorrer los datos devueltos por la consulta
				var item = JSON.parse(data)["resultados"][0];
				dataLayer.push({
			    	"event" : "service",
			    	"type" : "get_pri",
			    	"data" : item
			    });
				console.log(item);
				var title = " Editar informe " + item.informe + "| RAE: "+item.contratada.cliente.rae;
					$("#modal_"+seccion).find(".modal_txt_title").text(title);
					$("#modal_"+seccion).find(".modal_txt_btn_left").html("<i class='material-icons left'>save</i>Guardar");
					$("#modal_"+seccion).find(".modal_txt_btn_right").html("<i class='material-icons left'>exit_to_app</i>Salir");
					var frm_tabs = '<ul class="tabs modalEditar">' + 
						'<li class="tab col s3"><a class="tablink1" href="#tab1_pri" title="Datos"><i class="material-icons left">looks_one</i></a></li>' + 
						'<li class="tab col s3"><a class="active tablink2" href="#tab2_pri" title="Instalación"><i class="material-icons left">business</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink3" href="#tab3_pri" title="Ascensor"><i class="material-icons left">code</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink4" href="#tab4_pri" title="Mediciones realizadas"><i class="material-icons left">assignment</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink5" href="#tab5_pri" title="Checking"><i class="material-icons left">assignment_returned</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink6" href="#tab6_pri" title="Defectos detectados"><i class="material-icons left">assignment_late</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink7" href="#tab7_pri" title="Equipos"><i class="material-icons left">business_center</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink8" href="#tab8_pri" title="Resultado"><i class="material-icons left">assignment_turned_in</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink9" href="#tab9_pri" title="Firma"><i class="material-icons left">edit</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink10" href="#tab10_pri" title="Fotos"><i class="material-icons left">photo_camera</i></a></a></li>' + 
						'<li class="tab col s3"><a class="tablink11" href="#tab11_pri" title="Otros"><i class="material-icons left">settings</i></a></a></li>' + 
					'</ul>';
					var frm_render = '<form id="informe_frm_editar">' + 
						'<div id="tab1_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab2_pri" class="active col s12">' +  
						'</div>' +	
						'<div id="tab3_pri" class="col s12">' + 	    
						'</div>' +	
						'<div id="tab4_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab5_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab6_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab7_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab8_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab9_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab10_pri" class="col s12">' + 
						'</div>' +	
						'<div id="tab11_pri" class="col s12">' + 
						'</div>' +	
 					'</form>';
				  $("#modal_"+seccion).find(".contentTabs").html(frm_tabs);
				  $("#modal_"+seccion).find(".contentForm").html(frm_render);
				  $("#modal_"+seccion).find('.tabs').tabs();
				  $("#modal_"+seccion).modal({
						dismissible: false
					});
					// Abrir modal
					$("#modal_"+seccion).modal("open");		
			},
			error: function(xhr, status, error) {
				// Mostrar un mensaje de error en el centro de la pantalla
				$('#app-content div#error').html(error);
				$('#app-content div#error').show();
			}			
		});
	};
}

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