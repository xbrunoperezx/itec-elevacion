FROM php:8.2-apache

# Dependencias del sistema para GD
RUN apt-get update && apt-get install -y --no-install-recommends \
	libfreetype6-dev \
	libjpeg62-turbo-dev \
	libpng-dev \
	&& rm -rf /var/lib/apt/lists/*

# Instalar extensiones necesarias
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
	&& docker-php-ext-install mysqli pdo pdo_mysql gd exif

# Copiar el código al document root
COPY . /var/www/html/

# Permisos
RUN chown -R www-data:www-data /var/www/html

# Definir volumen persistente para las fotos
VOLUME ["/var/www/html/uploads"]
