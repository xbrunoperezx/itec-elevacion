
// ✅ AQUÍ va SOLO la lógica de filtros

function aplicarFiltros(){
    // obtenemos los valores que rellenamos en los campos inputs del html, compramos mayusc, minusc tambien
    let nombre= $('#filtro-nombre').val().toLowerCase();
    let localidad= $('#filtro-localidad').val().toLowerCase();
    let mantenedor= $('#filtro-mantenedor').val().toLowerCase();
    let direccion= $('#filtro-direccion').val().toLowerCase();
    let cp= $('#filtro-cp').val().toLowerCase();
    let vencimiento= $('#filtro-vencimiento').val().toLowerCase();

    // ahroa filtramos clientesGlobal (el array que contiene todos los clientes del back)
    let filtrados= clientesGlobal.filter(cliente => {
  
        //creamos condiciones para cada filtro
        let cumpleNombre=
            !nombre || cliente.nombre.toLowerCase().includes(nombre);
        let cumpleLocalidad=
            !localidad || cliente.localidad.toLowerCase().includes(localidad);
        let cumpleMantenedor=
            !mantenedor || cliente.mantenedor.toLowerCase().includes(mantenedor);
        let cumpleDireccion=
            !direccion || cliente.direccion.toLowerCase().includes(direccion);
        let cumpleCp=
            !cp || cliente.cp.toLowerCase().includes(cp);
        let cumpleVencimiento=
            !vencimiento || cliente.vencimiento_dmy.toLowerCase().includes(vencimiento);            
   
        // el cliente pasa el filtro si cumple los 3    
        return cumpleNombre && cumpleLocalidad && cumpleMantenedor && cumpleDireccion && cumpleCp && cumpleVencimiento;    


    });

    //pintamos la nueva tabla conlos clientes filtrados
    pintarTablaClientes(filtrados);
}

/**
 * Función para limpiar todos los filtros
 * Vacía los inputs y muestra todos los clientes
 */
function limpiarFiltros() {
    console.log('🧹 limpiarFiltros() ejecutada');
    
    // Vaciar todos los inputs de filtro
    $('#filtro-nombre').val('');
    $('#filtro-direccion').val('');
    $('#filtro-localidad').val('');
    $('#filtro-mantenedor').val('');
    $('#filtro-cp').val('');
    $('#filtro-vencimiento').val('');
    
    console.log('✅ Inputs vaciados');
    
    // Actualizar los labels de Materialize
    M.updateTextFields();
    
    console.log('✅ Labels actualizados');
    
    // Aplicar filtros (sin nada, mostrará todos)
    aplicarFiltros();
    
    console.log('✅ aplicarFiltros() ejecutada');
}