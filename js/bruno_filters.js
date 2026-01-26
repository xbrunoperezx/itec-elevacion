
function aplicarFiltros(){
    let nombre= $('#filtro-nombre').val().toLowerCase();
    let localidad= $('#filtro-localidad').val().toLowerCase();
    let idMantenedor= $('#filtro-mantenedor').val();

    let filtrados= clientesGlobal.filter(cliente => {
        
        let cumpleNombre=
            !nombre || cliente.nombre.toLowerCase().includes(nombre);
        let cumpleLocalidad=
            !localidad || cliente.localidad.toLowerCase().includes(localidad);
        let cumpleMantenedor=
            !idMantenedor || cliente.id_mantenedor== idMantenedor;
        
        return cumpleNombre && cumpleLocalidad && cumpleMantenedor;    


    });

    pintarTablaClientes(filtrados);
}