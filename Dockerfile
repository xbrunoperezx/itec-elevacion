# 1. Asegurar la versión parcheada de PHP 8.2 (8.2.35+)
FROM php:8.2.35-apache

# Extensiones necesarias
RUN docker-php-ext-install mysqli pdo pdo_mysql

# 2. Configurar php.ini base
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# 3. Mitigaciones específicas PHP2Shell + Endurecimiento
RUN { \
    echo 'expose_php = Off'; \
    echo 'display_errors = Off'; \
    echo 'display_startup_errors = Off'; \
    echo 'log_errors = On'; \
    echo 'error_log = /dev/stderr'; \
    # Mitigación vector CVE-2026-109619 (Upload Progress)
    echo 'session.upload_progress.enabled = Off'; \
    # Limitar anidación de inputs para evitar presión artificial de memoria
    echo 'max_input_nesting_level = 64'; \
    echo 'disable_functions = exec,passthru,shell_exec,system,proc_open,popen,parse_ini_file,show_source'; \
} > "$PHP_INI_DIR/conf.d/security.ini"

# 4. Ocultar banners de Apache
RUN { \
    echo 'ServerTokens Prod'; \
    echo 'ServerSignature Off'; \
} >> /etc/apache2/conf-available/security.conf \
    && a2enconf security

# 5. Código y permisos
COPY . /var/www/html/

RUN chown -R root:root /var/www/html \
    && find /var/www/html -type d -exec chmod 755 {} \; \
    && find /var/www/html -type f -exec chmod 644 {} \;
