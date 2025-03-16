#!/bin/sh

set -e

echo "Running migrations..."
migrate -path /app/db/migration -database "$DB_SOURCE" -verbose up

echo "Starting the application..."
exec "$@"
