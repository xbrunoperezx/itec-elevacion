        
        //FUNCION PINTAR TABLA CLIENTES
        function pintarTablaClientes(clientes){

            //4º  ---creamos un acumulador para no sobrescribir cada vuelta el cliente---
            let html = "";
            let contador = 1;

            //recorremos el array "response.resultados" con cada cliente
            clientes.forEach(function(cliente){
                let vencimiento= cliente.vencimiento_dmy ?? '-';
                // let contratadaTexto= cliente.contratada == 1 ? 'v' : '-';
                let iconoContratada= cliente.contratada ==1
                    ? '<i class="material-icons green-text">check_circle</i>'
                    : '<i class="material-icons red-text">cancel</i>';          
                         
                    //con el acumulador creado vamos añadiendo al html cada iteraccion del bucle un cliente 
                    html += `
                        <tr data-id="${cliente.id}">
                            <td>${contador}</td> 
                            <td>${cliente.nombre}</td>
                            <td>${cliente.direccion}</td>
                            <td>${cliente.localidad}</td>
                            <td>${cliente.mantenedor}</td>
                            <td>${cliente.cp}</td>
                            <td>${cliente.vencimiento_dmy ?? '-'}</td>
                            <td class="center-align">${iconoContratada}</td>
                                
                            <td>
                                <a href="#" class="btn-small blue ver-cliente" data-id="${cliente.id}"> 
                                    <i class="material-icons">visibility</i>
                                </a>
                                    
                                <a href="#" class="btn-small orange editar-cliente" data-id="${cliente.id}">
                                    <i class="material-icons">edit</i>
                                </a>
                                    
                                <a href="#" class="btn-small red eliminar-cliente" data-id="${cliente.id}">
                                    <i class="material-icons">delete</i>
                                </a>    

                            </td>
                        </tr>  
                    `;
                    contador ++;
            });
            
            $('#tabla-clientes').html(html)
        }