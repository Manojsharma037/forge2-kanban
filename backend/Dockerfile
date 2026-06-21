# Laravel API container for Render (Docker runtime).
FROM php:8.2-cli

# System libs + PHP extensions needed for SQLite.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libsqlite3-dev unzip git \
    && docker-php-ext-install pdo pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

# Composer (copied from the official image).
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Install PHP dependencies first (better layer caching).
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --optimize-autoloader --no-interaction

# App source.
COPY . .
RUN composer dump-autoload --optimize

RUN chmod +x docker-entrypoint.sh

# Render injects $PORT; the entrypoint binds to it.
EXPOSE 8000
CMD ["./docker-entrypoint.sh"]
