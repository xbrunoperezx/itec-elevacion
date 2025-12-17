<?php
	$link = mysqli_connect("89.46.111.32", "Sql1037579", "113668187c", "Sql1037579_1"); // BBDD de pruebas
	// $link = mysqli_connect("89.46.111.188", "Sql1396152", "5i4w182228", "Sql1396152_2"); <--- BBDD real i2C galicia
	mysqli_query($link, "SET SESSION sql_mode='ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION'");
	mysqli_set_charset($link,"utf8");
?>