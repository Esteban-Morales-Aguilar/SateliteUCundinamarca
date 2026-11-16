#!/usr/bin/env bash
# Reaplica los scripts de inicialización (idempotentes) sobre bases ya creadas.
# Útil si los volúmenes ya existían cuando se añadió un cambio de esquema.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a

echo "→ PostgreSQL (usuarios)"
docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER:-spacenet}" -d "${POSTGRES_DB:-spacenet}" < infrastructure/postgres/init.sql
echo "→ TimescaleDB (telemetría)"
docker compose exec -T timescaledb psql -v ON_ERROR_STOP=1 -U "${TIMESCALE_USER:-spacenet}" -d "${TIMESCALE_DB:-telemetry}" < infrastructure/timescaledb/init.sql
echo "→ MongoDB (contenido)"
docker compose exec -T mongo mongosh -u "${MONGO_USER:-spacenet}" -p "${MONGO_PASSWORD:?define MONGO_PASSWORD en .env}" --authenticationDatabase admin --quiet < infrastructure/mongodb/init.js
echo "✓ Bases inicializadas"
