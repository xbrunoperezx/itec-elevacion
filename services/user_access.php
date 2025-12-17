<?php
// Iniciamos la sesión para tener acceso a las variables de sesión
session_start();

// Verificamos si existen los datos del usuario enviados por POST
if (isset($_POST['user']) && isset($_POST['password'])) {
    // Conexión a la base de datos
    include("conn_bbdd.php");
    // $link = mysqli_connect("89.46.111.188", "Sql1396152", "5i4w182228", "Sql1396152_2");


    // Verificamos si la conexión a la base de datos es exitosa
    if (!$link) {
        // Mostramos un mensaje de error y terminamos la ejecución del script
        echo 'Error al conectarse a la base de datos';
        exit;
    }

    // Escapamos los datos del usuario para prevenir inyecciones SQL
    //$username = mysqli_real_escape_string($link, $_POST['user']);
    //$password = md5(mysqli_real_escape_string($link, $_POST['password']));
    $username = $_POST['user'];
    $password = md5($_POST['password']);

    // Definimos la consulta SQL para verificar si existe el usuario
    $sql = "SELECT * FROM usuarios WHERE user = '{$username}' AND password = '{$password}'";


    // Ejecutamos la consulta SQL
    $result = mysqli_query($link, $sql);

    // Verificamos si la consulta devuelve algún resultado
    if (mysqli_num_rows($result) > 0) {
        // Almacenamos el nombre de usuario en una variable de sesión

        $_SESSION['user'] = $username;
        // Establece la cookie de sesión
        setcookie("session", "autenticado", time() + 7200);  
        // Devolvemos un mensaje de éxito
        echo 'success';
    } else {
        // Devolvemos un mensaje de error
        echo 'Error al iniciar sesión, verifique su nombre de usuario y contraseña';
    }

    // Cerramos la conexión a la base de datos
    mysqli_close($link);
} else {
    // Devolvemos un mensaje de error si no existen los datos del usuario enviados por POST
    echo 'Debe enviar los datos del usuario para hacer login';
}
?>