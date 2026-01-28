
         // ✅ AQUÍ van funciones que ESCUCHAN eventos + utilidades

         
         //FUNCION comprobar que funciona el boton y muestra el ID(VER)
          $(document).on('click', '.ver-cliente', function(e){
            e.preventDefault();

            let id=$(this).data('id'); //esto era solo para mostrar el id con un console.log que habia echo
            
          /* 1º manera de recorrer clientes y buscar por id
          let clienteEncontrado = null;
            clientesGlobal.forEach(function(cliente){
                if(cliente.id ==id){
                    clienteEncontrado=cliente;
                }
            });
          */
            
          // 2º manera de hacerlo mas limpio con .find
            let cliente=clientesGlobal.find(c => c.id == id);

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
          $(document).on('click', '.editar-cliente', function(e){
            e.preventDefault();

            let id= $(this).data('id');// saber que boton e pulsado
            let cliente= clientesGlobal.find(c => c.id == id);

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

          //----------------------------------------------------------------
          //FUNCION para guardar cambios de ese cliente que hemos editado(BOTON GUARDAR)
          $('#guardar-cambios').on('click', function(){  

            // construimos el objeto que guarda los datos para logo enviarlo por ajax
            // que es lo que espera PHP por $_POST
            let datos ={
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
                success: function(response){
                    if(response.success){
                        //buscamos el cliente en el array global que  sea igual que el que acabo de editar
                        let cliente= clientesGlobal.find(c=> c.id == datos.id);

                        //actualizamos con los nuevos datos del cliente para que no sea la de antes (Desfasada)
                        cliente.nombre= datos.nombre;
                        cliente.direccion= datos.direccion;
                        cliente.localidad= datos.localidad;
                        cliente.id_mantenedor= datos.id_mantenedor;
                        cliente.cp= datos.cp;
                        cliente.vencimiento= datos.vencimiento;
                        cliente.contratada= datos.contratada;
                        
                        //con esto nos devuelve el nombre y no la ID(busca en el array global usando la id y nos devuelve su nombre)
                        cliente.mantenedor= mantenedoresGlobal[datos.id_mantenedor];

                        

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

          //-----------------------------------------------------------------
          //FUNCION para crear un nuevo cliente (BOTON CREAR CLIENTE)
          $('#crear-cliente').on('click', function(){
            
                let datos= {
                    nombre: $('#create-nombre').val(),
                    direccion: $('#create-direccion').val(),
                    localidad: $('#create-localidad').val(),
                    municipio: $('#create-municipio').val(),
                    id_mantenedor: $('#create-mantenedor').val(),
                    cp: $('#create-cp').val()

                };

                $.ajax({
                    url:'services/clientes_create.php',
                    type: 'POST',
                    data: datos,
                    dataType: 'json',
                    success: function(response){
                        if(response.success){
                            alert(response.message);

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
                            alert(response.message);
                        }

                    }
                });
          });

        
           //----------------------------------------------------------------
           //FUNCION comprobar que funciona el boton y muestra el ID(ELIMINAR)
           $(document).on('click', '.eliminar-cliente', function(e){
                e.preventDefault();

                let id=$(this).data('id');//comprobamos que el data-id coincide

                // creamos una condicional para que no borremos por error que nos aparezca un mensaje de confirmacion
                if(confirm('¿Seguro que quieres eliminar este cliente?')){
                    $.ajax({
                        type: "POST",
                        url: "services/clientes_delete.php",
                        data: { id: id},
                        dataType: "json",
                        success: function(response){
                            if(response.success){
                                //sobreescribimos el array de clientes paraque solo mantenga los que no queremos borrar
                                clientesGlobal= clientesGlobal.filter(c=> c.id != id);
                                
                                
                                pintarTablaClientes(clientesGlobal);
                                aplicarFiltros();
                                alert(response.message);

                                //ahora buscamos la fila de ese cliente "<tr>" que tenga ese data-id y es la que eliminamos
                                //$(`tr[data-id="${id}"]`).remove();  
                                
                                
                            } else {
                                alert(response.message);
                            }
                        }
                      
                    });
                }
           
           }); 
           
           // Eventos para filtros por teclado (en tiempo real)
           $('#filtro-nombre').on('keyup', aplicarFiltros);
           $('#filtro-localidad').on('keyup', aplicarFiltros);
           $('#filtro-mantenedor').on('keyup', aplicarFiltros);
           $('#filtro-direccion').on('keyup', aplicarFiltros);
           $('#filtro-cp').on('keyup', aplicarFiltros);
           $('#filtro-vencimiento').on('keyup', aplicarFiltros);
           
           // Evento para presionar ENTER en los campos de filtro
           //aqui seleciono los 3 inputs que quiero  de filtro y con on.('keypress) un evento que escucha cuando presionas una tecla
           $('#filtro-nombre, #filtro-localidad, #filtro-mantenedor, #filtro-direccion, #filtro-cp, #filtro-vencimiento').on('keypress', function(e) {
               //aqui es si la tecla presionada es ENTER
               if(e.key === 'Enter') {
                   e.preventDefault();
                   aplicarFiltros(); //aplicamos los filtros
               }
           });
           
           // Evento para botón filtrar (manual)
           $('#btn-filtrar').on('click', aplicarFiltros);

