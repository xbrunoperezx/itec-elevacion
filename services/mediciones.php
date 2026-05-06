<?php
	session_start();
	include_once("conn_bbdd.php");
	header("Content-Type: application/json");

	$action = isset($_POST['action']) ? $_POST['action'] : '';
	$id_informe = isset($_POST['id_informe']) ? intval($_POST['id_informe']) : 0;
	$medidas_json = isset($_POST['medidas_json']) ? $_POST['medidas_json'] : '';

	switch($action){
		case 'get':
			if($id_informe === 0){
				echo json_encode(array('error' => 'ID informe no proporcionado'));
				break;
			}

			$sql = "SELECT * FROM `informe_mediciones` WHERE `id_informe` = {$id_informe}";
			$result = mysqli_query($link, $sql);

			if(mysqli_num_rows($result) > 0){
				$row = mysqli_fetch_assoc($result);
				$medidas_json_parsed = $row['medidas_json'];
				if(is_string($medidas_json_parsed)){
					$medidas_json_parsed = json_decode($medidas_json_parsed, true);
				}
				echo json_encode(array(
					'id' => $row['id'],
					'id_informe' => $row['id_informe'],
					'medidas_json' => $medidas_json_parsed
				));
			} else {
				echo json_encode(array(
					'id' => null,
					'id_informe' => $id_informe,
					'medidas_json' => array()
				));
			}
			break;

		case 'save':
			if($id_informe === 0){
				echo json_encode(array('error' => 'ID informe no proporcionado'));
				break;
			}

			// Validar que medidas_json sea JSON válido
			$medidas_array = array();
			if(!empty($medidas_json)){
				$medidas_array = is_string($medidas_json) ? json_decode($medidas_json, true) : $medidas_json;
				if(!is_array($medidas_array)){
					echo json_encode(array('error' => 'Formato JSON inválido en medidas'));
					break;
				}
			}

			$medidas_json_str = !empty($medidas_array) ? json_encode($medidas_array) : json_encode(array());
			$medidas_json_escaped = mysqli_real_escape_string($link, $medidas_json_str);

			// Verificar si existe registro
			$sql_check = "SELECT `id` FROM `informe_mediciones` WHERE `id_informe` = {$id_informe}";
			$result_check = mysqli_query($link, $sql_check);

			if(mysqli_num_rows($result_check) > 0){
				// UPDATE
				$sql = "UPDATE `informe_mediciones` SET `medidas_json` = '{$medidas_json_escaped}' WHERE `id_informe` = {$id_informe}";
			} else {
				// INSERT
				$sql = "INSERT INTO `informe_mediciones` (`id_informe`, `medidas_json`) VALUES ({$id_informe}, '{$medidas_json_escaped}')";
			}

			if(mysqli_query($link, $sql)){
				echo json_encode(array('success' => true, 'message' => 'Mediciones guardadas correctamente'));
			} else {
				echo json_encode(array('error' => 'Error al guardar mediciones: ' . mysqli_error($link)));
			}
			break;

		default:
			echo json_encode(array('error' => 'Acción no válida'));
			break;
	}
?>
