<?php
  // Comprobar si la cookie "session" existe y su fecha de expiración
  if (isset($_COOKIE['session']) && $_COOKIE['session'] == "autenticado") {
    setcookie("session", "autenticado", time() + 3600);  
    echo "extended session for +60min";
  } else {
    echo "expired";
  }
?>