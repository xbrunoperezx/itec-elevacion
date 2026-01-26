
    //creamos una variable acessible desde cualquier punto del programa que en ella recogeremos el array de clientes del back
    let clientesGlobal=[];
    let mantenedoresGlobal=[];

     $(document).ready(function(){ 
        //inicializamos el modal, por que si no no existe
        $('.modal').modal();
        //inicializamos el select
        $('select').formSelect();

        cargarClientes(); //la creamos ahora

           
    });//cierre de la funcion de carga $(document).rea..