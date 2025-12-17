<?php
	$link = mysqli_connect("ikw4cos008ksg4w4g04cso4k", "itec_elevacion", "mysql", "LELGRzf6r3yJoSzmYzvcgZK59KjxCYdGgc6q4dTjXLbxbtTlW2xKbHa6WgwTetXf"); // BBDD de pruebas
	// $link = mysqli_connect("89.46.111.188", "Sql1396152", "5i4w182228", "Sql1396152_2"); <--- BBDD real i2C galicia
	mysqli_query($link, "SET SESSION sql_mode='ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'");
	mysqli_set_charset($link,"utf8");
?>