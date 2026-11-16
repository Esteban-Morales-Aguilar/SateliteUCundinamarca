#!/usr/bin/env bash
# Prueba de integración mínima contra el stack levantado: login admin -> rutas protegidas.
set -euo pipefail
cd "$(dirname "$0")/../.."
[ -f .env ] && set -a && . ./.env && set +a
BASE="${BASE_URL:-http://localhost}"
fail() { echo "✘ $1"; exit 1; }

TOKEN=$(curl -fsS -X POST "$BASE/api/v1/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" | python3 -c 'import sys,json;print(json.load(sys.stdin)["accessToken"])') || fail "login admin"
echo "✔ login admin"

code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/v1/users"); [ "$code" = 401 ] || fail "/users sin token debe ser 401 (fue $code)"; echo "✔ /users exige token"
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/v1/users" -H "Authorization: Bearer $TOKEN"); [ "$code" = 200 ] || fail "/users admin (fue $code)"; echo "✔ /users como admin"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/v1/content/marco-teorico" -H 'Content-Type: application/json' -d '{}'); [ "$code" = 401 ] || fail "POST contenido sin token (fue $code)"; echo "✔ escritura de contenido protegida"
curl -fsS "$BASE/api/v1/telemetry/latest" >/dev/null || fail "telemetría (¿TELEMETRY_DEMO=true?)"; echo "✔ telemetría disponible"
echo "✓ Integración OK"
