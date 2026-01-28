
        // ✅ AQUÍ van llamadas AJAX al backend

        
        //cargamos la web (el JS) nada mas acceder a la Url
        function cargarClientes(){
            $.ajax({ //aqui hacemos la peticion de los datos al back (ajax no recarga la pagina)
                //donde lo llamo 
                type:"POST",
                //como lo llamo
                url:"services/clientes.php", 
                //que mando
                data:{  
                    filtro_total: 15
                },
                //que hago cuando vuelve? ->successs/error
                dataType: "json",
                success: function(response){ //el response es el objeto que vi en POSTMAN la respuesta en JSON
                    //aqui llega la respuesta el JSON

                    // 1º  ----pinto en consola-----
                    //console.log(response)

                    //2º  ----muestro un parrafo en el contenedor del div creado  por la id resultado.----
                    //$('#resultado').html('<p>Hola, el js funciona </p>')

                    //3º  --- ahora filtro  que cliente  quiero mostrar en  la  posicion----
                    //let cliente= response.resultados[0];

                    //--- aqui elijo que datos quiero mostrar/pintar llamando a cliente siempre---
                    //let html= `

                        //<p> 
                            //<strong>Nombre:</strong> ${cliente.nombre}<br>
                            //<strong>direccion:</strong> ${cliente.direccion}
                        //</p>    
                    //`;

                    //---muestro los dos clientes en parrafos con su nombre y direccion
                    //$('#resultado').html(html)

                    
                    //guardamos  el array de clientes traidos del back, en la variable local
                    clientesGlobal=response.resultados;
                    mantenedoresGlobal=response.mantenedores;

                    //LLAMADA FUNCION PINTAR TABLA CON CLIENTES
                    pintarTablaClientes(clientesGlobal);
                    rellenarSelects(); 
                    let opcionesFiltro= '<option value="">Todos</option>';
                    for(let id in mantenedoresGlobal){
                        opcionesFiltro+= `<option value="${id}">${mantenedoresGlobal[id]}</option>`;
                    }

                    $('#filtro-mantenedor').html(opcionesFiltro);
                    $('select').formSelect();


                }
               
              
            })//cierre de ajax
        }    