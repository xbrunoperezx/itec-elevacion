<?php
// Eliminar sesión y cookies relacionadas
if (session_status() == PHP_SESSION_NONE) session_start();
// Vaciar variables de sesión
$_SESSION = array();
// Eliminar cookie de sesión de PHP si existe
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], isset($params['domain']) ? $params['domain'] : '', isset($params['secure']) ? $params['secure'] : false, isset($params['httponly']) ? $params['httponly'] : false);
}
// destruir la sesión
session_destroy();
// eliminar cookies de aplicación
// Intentar borrar cookies en la raíz y en la ruta /services (donde se crearon originalmente)
setcookie('user_id', '', time() - 3600, '/');
setcookie('session', '', time() - 3600, '/');
setcookie('user_id', '', time() - 3600, '/services');
setcookie('session', '', time() - 3600, '/services');
// respuesta simple
echo 'OK';
exit;
?>