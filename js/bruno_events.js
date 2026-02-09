
// ✅ AQUÍ van funciones que ESCUCHAN eventos + utilidades


//FUNCION comprobar que funciona el boton y muestra el ID(VER)
$(document).on('click', '.ver-cliente', function (e) {
    e.preventDefault();

    let id = $(this).data('id'); //esto era solo para mostrar el id con un console.log que habia echo

    /* 1º manera de recorrer clientes y buscar por id
    let clienteEncontrado = null;
      clientesGlobal.forEach(function(cliente){
          if(cliente.id ==id){
              clienteEncontrado=cliente;
          }
      });
    */

    // 2º manera de hacerlo mas limpio con .find
    let cliente = clientesGlobal.find(c => c.id == id);

    //ahora pintamos los datos del modal cogiendo la id que creamos en el html
    $('#m-nombre').text(cliente.nombre);
    $('#m-direccion').text(cliente.direccion);
    $('#m-localidad').text(cliente.localidad);
    $('#m-mantenedor').text(cliente.mantenedor);
    $('#m-cp').text(cliente.cp);

    //abrimos el modal con el id creado arriba en el html en el div general
    $('#modal-cliente').modal('open');
});

//--------------------------------------------------------------
//FUNCION comprobar que funciona el boton y muestra el ID(EDITAR/UPDATE)
$(document).on('click', '.editar-cliente', function (e) {
    e.preventDefault();

    let id = $(this).data('id');// saber que boton e pulsado
    let cliente = clientesGlobal.find(c => c.id == id);

    $('#edit-id').val(cliente.id);
    $('#edit-nombre').val(cliente.nombre);
    $('#edit-direccion').val(cliente.direccion);
    $('#edit-localidad').val(cliente.localidad);
    $('#edit-mantenedor').val(cliente.id_mantenedor);
    $('#edit-cp').val(cliente.cp);
    $('#edit-vencimiento').val(cliente.vencimiento);
    $('#edit-contratada').prop('checked', cliente.contratada == 1);
    $('select').formSelect();

    M.updateTextFields();//para mover las etiquetas de label si esta vacio o no el input
    $('#modal-editar-cliente').modal('open');

});

//FUNCION para validar el formulario a la hora de editar el cliente
function validarFormularioUpdate(){
    let datos= {
        nombre: $('#edit-nombre').val(),
        direccion: $('#edit-direccion').val(),
        localidad: $('#edit-localidad').val(),
        id_mantenedor: $('#edit-mantenedor').val(),
        cp: $('#edit-cp').val(),
        vencimiento: $('#edit-vencimiento').val()
    };

    if(datos.nombre === ''){
        return "El nombre es obligatorio";
    } else if (datos.direccion === ''){
        return "La direccion es obligatoria";
    } else if(datos.localidad === ''){
        return "La localidad es obligatoria";
    } else if(datos.cp.match(/^\d{5}$/) === null ){
        return "El cp debe tener exactamente 5 dígitos";
    } else if(datos.id_mantenedor === '' || datos.id_mantenedor === null || datos.id_mantenedor === undefined){
        return "Debes seleccionar un mantenedor";
    } else if (datos.vencimiento === ''){
        return "Debes seleccionar una fecha válida";
    } else {
        return null;
    }
}

//----------------------------------------------------------------
//FUNCION para guardar cambios de ese cliente que hemos editado(BOTON GUARDAR)
$('#guardar-cambios').on('click', function () {


    //creamos variable de llamada al la funcion de validar
    let error = validarFormularioUpdate();

    //si hay un error mostramos este mensaje y no seguimos haciendo la llamada a ajax ni recojiendo datos en objeto
    if (error !== null) {
        mostrarMensaje('⚠️ Error de validación', error, 'warning');
        return; //aqui pàra y no continua
    }


    //si no hay error continua con el Ajax

    // construimos el objeto que guarda los datos para logo enviarlo por ajax
    // que es lo que espera PHP por $_POST
    let datos = {
        id: $('#edit-id').val(),
        nombre: $('#edit-nombre').val(),
        direccion: $('#edit-direccion').val(),
        localidad: $('#edit-localidad').val(),
        id_mantenedor: $('#edit-mantenedor').val(),
        cp: $('#edit-cp').val(),
        vencimiento: $('#edit-vencimiento').val(),
        contratada: $('#edit-contratada').is(':checked') ? 1 : 0

    };

    $.ajax({
        url: 'services/clientes_update.php',
        type: 'POST',
        data: datos,
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                //buscamos el cliente en el array global que  sea igual que el que acabo de editar
                let cliente = clientesGlobal.find(c => c.id == datos.id);

                //actualizamos con los nuevos datos del cliente para que no sea la de antes (Desfasada)
                cliente.nombre = datos.nombre;
                cliente.direccion = datos.direccion;
                cliente.localidad = datos.localidad;
                cliente.id_mantenedor = datos.id_mantenedor;
                cliente.cp = datos.cp;
                cliente.vencimiento = response.datos.vencimiento;
                cliente.contratada = datos.contratada;

                //con esto nos devuelve el nombre y no la ID(busca en el array global usando la id y nos devuelve su nombre)
                cliente.mantenedor = mantenedoresGlobal[datos.id_mantenedor];



                //llamada a funcion 
                pintarTablaClientes(clientesGlobal);
                aplicarFiltros();
                $('#modal-editar-cliente').modal('close');




                //---
                //let textoContratada= datos.contratada == 1 ? 'v' : '-';
                //let iconoContratada= cliente.contratada == 1
                //  ? '<i class="material-icons green-text">check_circle</i>'
                //: '<i class="material-icons red-text">cancel</i>';


                //buscamos la fila en la tabla del cliente que editamos
                //let fila= $(`tr[data-id= "${datos.id}"]`);

                //actualizamos ahora solo la fila que editamos
                //fila.find('td').eq(1).text(cliente.nombre);
                //fila.find('td').eq(2).text(cliente.direccion);
                //fila.find('td').eq(3).text(cliente.localidad);
                //fila.find('td').eq(4).text(cliente.mantenedor);
                //fila.find('td').eq(5).text(cliente.cp);
                //fila.find('td').eq(6).text(datos.vencimiento);
                //fila.find('td').eq(7).html(iconoContratada);


                //cerramos el modal/ventana por que ya se guardo cliente

            }


        }
    });
});

//----------------------------------------------------------------
//FUNCION para validar el formulario a la hora de crear el cliente
function validarFormularioCreate() {

    
    //creamos objeto que recoja los valores del imput de los campos
    let datos = {
        nombre: $('#create-nombre').val(),
        direccion: $('#create-direccion').val(),
        localidad: $('#create-localidad').val(),
        municipio: $('#create-municipio').val(),
        mantenedor: $('#create-mantenedor').val(),
        cp: $('#create-cp').val()
    };

    

    //condicion para validar los campos del crear cliente
    if (datos.nombre === '') {
        return "El nombre es obligatorio";
    } else if (datos.direccion === '') {
        return "La dirección es obligatoria";
    } else if (datos.localidad === '') {
        return "La localidad es obligatoria";
    } else if (datos.municipio === '') {
        return "El municipio es obligatorio";
    } else if (datos.mantenedor === '' || datos.mantenedor === null || datos.mantenedor === undefined) {
        return "Debes seleccionar un mantenedor";
    } else if (datos.cp.match(/^\d{5}$/) === null) {
        return "El CP debe tener exactamente 5 dígitos";
    } else {
        return null;
    }

}

//-----------------------------------------------------------------
//FUNCION para crear un nuevo cliente (BOTON CREAR CLIENTE)
$('#crear-cliente').on('click', function () {
    //creamos variable de llamada al la funcion de validar
    let error = validarFormularioCreate();

    //si hay un error mostramos estemensaje y no seguimos haciendo la llamada a ajax ni recojiendo datos en objeto
    if (error !== null) {
        mostrarMensaje('⚠️ Error de validación', error, 'warning');
        return; //aqui pàra y no continua
    }

    //si no hay error continua con el Ajax

    let datos = {
        nombre: $('#create-nombre').val(),
        direccion: $('#create-direccion').val(),
        localidad: $('#create-localidad').val(),
        municipio: $('#create-municipio').val(),
        id_mantenedor: $('#create-mantenedor').val(),
        cp: $('#create-cp').val()

    };

    $.ajax({
        url: 'services/clientes_create.php',
        type: 'POST',
        data: datos,
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                mostrarMensaje('✅ Éxito', response.message, 'success');

                //aqui añadimos el nuevo cliente con el metodo .unshift lo añadimos al principio del array de clientesGlobal
                //si quisiesmos añadirlo al final seria con .push, pero por logica qeremos que se vea el primero
                clientesGlobal.unshift(response.cliente);

                pintarTablaClientes(clientesGlobal);

                aplicarFiltros();

                //ahora limpiamos el formulario
                $('#modal-crear-cliente input').val('');
                M.updateTextFields();
                //cerramos el modal
                $('#modal-crear-cliente').modal('close');


            } else {
                mostrarMensaje('❌ Error', response.message, 'error');
            }

        }
    });
});


//----------------------------------------------------------------
//FUNCION comprobar que funciona el boton y muestra el ID(ELIMINAR)
$(document).on('click', '.eliminar-cliente', function (e) {
    e.preventDefault();

    let id = $(this).data('id');//comprobamos que el data-id coincide

    // creamos una condicional para que no borremos por error que nos aparezca un mensaje de confirmacion
    mostrarConfirmacion('⚠️ Confirmar eliminación', '¿Seguro que quieres eliminar este cliente?', function () {
        $.ajax({
            type: "POST",
            url: "services/clientes_delete.php",
            data: { id: id },
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    //sobreescribimos el array de clientes paraque solo mantenga los que no queremos borrar
                    clientesGlobal = clientesGlobal.filter(c => c.id != id);


                    pintarTablaClientes(clientesGlobal);
                    aplicarFiltros();
                    mostrarMensaje('✅ Eliminado', response.message, 'success');

                    //ahora buscamos la fila de ese cliente "<tr>" que tenga ese data-id y es la que eliminamos
                    //$(`tr[data-id="${id}"]`).remove();  


                } else {
                    mostrarMensaje('❌ Error', response.message, 'error');
                }
            }

        });
    });
});


//----------------------------------------------------------------
//FUNCION  para mostrarlos mensajes

/**
 * funcion paramostrar un modal de mensaje elegante
 * @param {string} titulo - titulo del modal
 * @param {string} mensaje - contenido del mensaje
 * @param {string} tipoBoton - 'aceptar' o 'cerrar' (opcional)
 */
function mostrarMensaje(titulo, mensaje, tipoBoton = 'aceptar') {
    $('#msg-titulo').text(titulo);
    $('#msg-contenido').text(mensaje);

    // Limpiar botones anteriores del confirmación
    $('#msg-cancelar').remove();

    // Resetear el botón principal y eliminar listeners antiguos

    $('#msg-boton').removeClass('btn-danger btn-warning btn-success red orange green');
    $('#msg-boton').text('Aceptar');
    $('#msg-boton').off('click');


    //cambiar el color y texto del boton segunel tipo
    if (tipoBoton === 'error') {
        $('#msg-boton').removeClass('btn-success btn-warning').addClass('btn-danger red');
    } else if (tipoBoton === 'warning') {
        $('#msg-boton').removeClass('btn-danger btn-success').addClass('btn-warning orange');
    } else {
        $('#msg-boton').removeClass('btn-danger btn-warning').addClass('btn-success green')
    }

    //Abrimos el modal
    $('#modal-mensaje').modal('open');

}


/**
 * Función para mostrar un modal de confirmación con dos botones (Sí/No)
 * @param {string} titulo - Título del modal
 * @param {string} mensaje - Contenido del mensaje
 * @param {function} callback - Función que se ejecuta si presiona "Sí"
 */
function mostrarConfirmacion(titulo, mensaje, callback) {
    $('#msg-titulo').text(titulo);
    $('#msg-contenido').text(mensaje);

    // Cambiar botón a rojo (estilo de confirmación)
    $('#msg-boton').removeClass('btn-success btn-warning').addClass('btn-danger red');
    $('#msg-boton').text('Sí, eliminar');

    // Agregar botón "Cancelar"
    $('#msg-cancelar').remove(); // eliminamos el anterior si existe (Boton)
    $('#msg-boton').after('<a href="#!" class="modal-close btn grey" id="msg-cancelar">Cancelar</a>');

    // Si presiona "Sí"
    $('#msg-boton').off('click').on('click', function () {
        callback();  // Ejecuta la función que le pasamos
        $('#modal-mensaje').modal('close');
    });

    // Limpiar el botón cancelar anterior
    $('#msg-cancelar').off('click');

    // Abrir modal
    $('#modal-mensaje').modal('open');
}




// *********eventos y liseners********

// -----Eventos para filtros por teclado (en tiempo real)-----
$('#filtro-nombre').on('keyup', aplicarFiltros);
$('#filtro-localidad').on('keyup', aplicarFiltros);
$('#filtro-mantenedor').on('keyup', aplicarFiltros);
$('#filtro-direccion').on('keyup', aplicarFiltros);
$('#filtro-cp').on('keyup', aplicarFiltros);
$('#filtro-vencimiento').on('keyup', aplicarFiltros);


//---- Evento para presionar ENTER en los campos de filtro------
//aqui seleciono los 3 inputs que quiero  de filtro y con on.('keypress) un evento que escucha cuando presionas una tecla
$('#filtro-nombre, #filtro-localidad, #filtro-mantenedor, #filtro-direccion, #filtro-cp, #filtro-vencimiento').on('keypress', function (e) {
    //aqui es si la tecla presionada es ENTER
    if (e.key === 'Enter') {
        e.preventDefault();
        aplicarFiltros(); //aplicamos los filtros
    }
});

//----- Evento para botón filtrar (manual)--------
$(document).on('click', '#btn-filtrar', function () {
    aplicarFiltros();
});

//-----Evento para botón limpiar filtros (función en bruno_filters.js)-----
$(document).on('click', '#btn-limpiar-filtros', function () {
    limpiarFiltros();
});

