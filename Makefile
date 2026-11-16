.PHONY: help up up-dev down build logs ps prod test test-node test-py test-front lint audit seed pdfs health init-db clean e2e
help: ## Lista los comandos
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-12s %s\n", $$1, $$2}'

up: ## Levanta todo en local (crea .env si no existe)
	@test -f .env || cp .env.example .env
	docker compose up -d --build
	@echo "→ http://localhost  |  Grafana http://localhost:3000  |  Traefik http://localhost:8080"
down: ## Detiene los contenedores
	docker compose down
build: ## Construye las imágenes
	docker compose build
logs: ## Sigue los logs
	docker compose logs -f --tail=100
ps: ## Estado de los contenedores
	docker compose ps
prod: ## Despliegue de producción (requiere DOMAIN y ACME_EMAIL en .env)
	./scripts/set-acme-email.sh
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

test: test-node test-py test-front ## Todos los tests unitarios
test-node:
	for s in auth-service content-service media-service; do (cd services/$$s && npm ci && npm test) || exit 1; done
test-py:
	for s in simulation-service telemetry-service; do (cd services/$$s && pip install -q -r requirements.txt && python -m pytest -q) || exit 1; done
test-front:
	cd frontend && npm ci && npm test && npm run build
lint: ## Tipos (tsc) y Ruff
	for s in auth-service content-service media-service; do (cd services/$$s && npx tsc --noEmit) || exit 1; done
	cd frontend && npx tsc --noEmit
	ruff check services/telemetry-service services/simulation-service
audit: ## Auditoría de dependencias
	for s in auth-service content-service media-service; do (cd services/$$s && npm audit --omit=dev || true); done
	cd frontend && npm audit --omit=dev || true
	pip-audit -r services/telemetry-service/requirements.txt || true
	pip-audit -r services/simulation-service/requirements.txt || true
e2e: ## Pruebas E2E (requiere `make up`)
	cd tests/e2e && npm install && npx playwright install --with-deps chromium && npx playwright test

seed: ## Sube PDFs de guías (y VIDEO=/POSTER= si se indican) a MinIO
	./scripts/seed-data.sh
pdfs: ## Regenera los PDF de guías desde la API (requiere reportlab)
	python3 scripts/generate_pdfs.py guias --source http://localhost/api/v1/content/guias --out seed/media/pdfs
	python3 scripts/generate_pdfs.py refs --source http://localhost/api/v1/content/referencias --out seed/media/pdfs
init-db: ## Reaplica init de las bases (idempotente)
	./scripts/init-db.sh
health: ## Comprueba /health de cada servicio
	./scripts/healthcheck.sh
clean: ## Detiene y BORRA los volúmenes (¡pierde datos!)
	docker compose down -v

up-dev: ## Como `up`, publicando los puertos de cada servicio (Swagger, RabbitMQ, MinIO)
	@test -f .env || cp .env.example .env
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
