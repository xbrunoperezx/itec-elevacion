<?php
try {
    $host = "ikw4cos008ksg4w4g04cso4k";
    $db   = "itec_elevacion";
    $user = "mysql";
    $pass = "LELGRzf6r3yJoSzmYzvcgZK59KjxCYdGgc6q4dTjXLbxbtTlW2xKbHa6WgwTetXf";

    $link = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

} catch (PDOException $e) {
    http_response_code(500);
    echo "Error de conexión a la base de datos";
    exit;
}
