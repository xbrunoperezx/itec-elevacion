
function aplicarFiltros(){
    // obtenemos los valores que rellenamos en los campos inputs del html, compramos mayusc, minusc tambien
    let nombre= $('#filtro-nombre').val().toLowerCase();
    let localidad= $('#filtro-localidad').val().toLowerCase();
    let mantenedor= $('#filtro-mantenedor').val().toLowerCase();

    // ahroa filtramos clientesGlobal (el array que contiene todos los clientes del back)
    let filtrados= clientesGlobal.filter(cliente => {
  
        //creamos condiciones para cada filtro
        let cumpleNombre=
            !nombre || cliente.nombre.toLowerCase().includes(nombre);
        let cumpleLocalidad=
            !localidad || cliente.localidad.toLowerCase().includes(localidad);
        let cumpleMantenedor=
            !mantenedor || cliente.mantenedor.toLowerCase().includes(mantenedor);
   
        // el cliente pasa el filtro si cumple los 3    
        return cumpleNombre && cumpleLocalidad && cumpleMantenedor;    


    });

    //pintamos la nueva tabla conlos clientes filtrados
    pintarTablaClientes(filtrados);
}