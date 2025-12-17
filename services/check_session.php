<?php
  // Comprobar si la cookie "session" existe y su fecha de expiración
  if (isset($_COOKIE['session']) && $_COOKIE['session'] == "autenticado") {
    echo "active";
  } else {
    echo "expired";
  }
?>