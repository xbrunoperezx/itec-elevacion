FROM php:8.2-apache

# Instalar PDO MySQL y extensiones necesarias
RUN docker-php-ext-install pdo pdo_mysql

# Copia el código al document root
COPY . /var/www/html/

# Da permisos de lectura/escritura si lo necesitas
RUN chown -R www-data:www-data /var/www/html
