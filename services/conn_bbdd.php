<?php
try{
    $link = mysqli_connect(
        "ikw4cos008ksg4w4g04cso4k", 
        "mysql",
        "LELGRzf6r3yJoSzmYzvcgZK59KjxCYdGgc6q4dTjXLbxbtTlW2xKbHa6WgwTetXf", 
        "itec_elevacion_dev"
    );

    if (!$link) {
        die("Conexión fallida: " . mysqli_connect_error());
    }

    // Charset utf8
    mysqli_set_charset($link, "utf8");
} catch (Exception $e) {
    echo 'Excepción capturada: ',  $e->getMessage(), "\n";
}
    
?>