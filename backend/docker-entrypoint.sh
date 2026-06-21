#!/usr/bin/env bash
set -e
cd /app

# Laravel reads real environment variables, but artisan commands (key:generate)
# expect a .env file to exist. Create one from the example if missing.
[ -f .env ] || cp .env.example .env

# Use a provided APP_KEY (set as a Render env var) or generate one on boot.
if [ -z "${APP_KEY}" ]; then
  php artisan key:generate --force
fi

# SQLite database file. Render's free filesystem is ephemeral, so the DB is
# rebuilt and reseeded on each boot — which keeps the demo board (#1) present.
mkdir -p database
touch database/database.sqlite

php artisan migrate:fresh --seed --force
php artisan config:clear || true

# Bind to the port Render provides (defaults to 8000 for local docker runs).
php artisan serve --host 0.0.0.0 --port "${PORT:-8000}"
