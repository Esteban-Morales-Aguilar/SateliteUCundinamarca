#!/usr/bin/env bash
# Traefik no permite mezclar archivo estático y variables de entorno: el correo de Let's Encrypt
# se escribe en infrastructure/traefik/traefik.yml a partir de ACME_EMAIL (.env).
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a
: "${ACME_EMAIL:?define ACME_EMAIL en .env}"
sed -i.bak -E "s|^(\s*email:\s*).*$|\1${ACME_EMAIL}|" infrastructure/traefik/traefik.yml && rm -f infrastructure/traefik/traefik.yml.bak
grep -n "email:" infrastructure/traefik/traefik.yml
