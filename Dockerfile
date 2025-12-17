FROM php:8.2-apache

# Instalar extensiones necesarias
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copiar el código al document root
COPY . /var/www/html/

# Permisos
RUN chown -R www-data:www-data /var/www/html
