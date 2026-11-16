#!/usr/bin/env bash
set -u; ok=0; fail=0
check() { n=$1; shift; if docker compose exec -T "$n" "$@" >/dev/null 2>&1; then echo "✔ $n"; ok=$((ok+1)); else echo "✘ $n"; fail=$((fail+1)); fi; }
check auth-service wget -qO- http://localhost:3001/health
check content-service wget -qO- http://localhost:3002/health
check telemetry-service python -c "import urllib.request;urllib.request.urlopen('http://localhost:3003/health')"
check simulation-service python -c "import urllib.request;urllib.request.urlopen('http://localhost:3004/health')"
check media-service wget -qO- http://localhost:3005/health
echo "OK: $ok FAIL: $fail"; [ "$fail" -eq 0 ]
