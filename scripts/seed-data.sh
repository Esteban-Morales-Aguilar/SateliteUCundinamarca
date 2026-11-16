#!/usr/bin/env bash
# Siembra los medios del ODC en MinIO a través del media-service (como admin):
#   - PDFs de las 5 guías técnicas (seed/media/pdfs/*.pdf)
#   - PDF de referencias APA 7 (si existe seed/media/pdfs/referencias-apa7.pdf)
#   - Video y miniatura (opcionales): VIDEO=ruta.mp4 POSTER=ruta.png ./scripts/seed-data.sh
# El contenido textual (marco teórico, guías, créditos) lo siembra solo el content-service al arrancar.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a

BASE="${BASE_URL:-http://localhost}"
EMAIL="${ADMIN_EMAIL:-admin@spacenet.local}"
PASS="${ADMIN_PASSWORD:?define ADMIN_PASSWORD en .env}"

echo "→ Esperando al gateway en $BASE ..."
for i in $(seq 1 60); do
  curl -fsS "$BASE/api/v1/content/creditos" >/dev/null 2>&1 && break
  [ "$i" -eq 60 ] && { echo "✘ El servicio no respondió a tiempo"; exit 1; }
  sleep 3
done

TOKEN=$(curl -fsS -X POST "$BASE/api/v1/auth/login" -H 'Content-Type: application/json' \
  -d "$(printf '{"email":"%s","password":"%s"}' "$EMAIL" "$PASS")" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["accessToken"])')

# NOTA: en el multipart, "kind" e "id" deben ir ANTES de "file".
upload() { # kind id file
  curl -fsS -X POST "$BASE/api/v1/media/upload" -H "Authorization: Bearer $TOKEN" \
    -F "kind=$1" -F "id=$2" -F "file=@$3" >/dev/null && echo "  ✓ $1/$2"
}

shopt -s nullglob
for f in seed/media/pdfs/*.pdf; do upload pdfs "$(basename "$f")" "$f"; done
[ -n "${VIDEO:-}" ]  && upload video  "estratosat-telco-despliegue.mp4" "$VIDEO"
[ -n "${POSTER:-}" ] && upload images "estratosat-telco-miniatura.webp" "$POSTER"
echo "✓ Medios sembrados"
