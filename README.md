# 🛰️ SateliteUCundinamarca — SpaceNet Lab

> Plataforma web de internet satelital para Cundinamarca (Colombia): sitio institucional, panel administrativo y microservicios (auth, contenido, telemetría, simulación, media). Docker Compose, Traefik, PostgreSQL/TimescaleDB, MongoDB, Redis, RabbitMQ, MinIO.

**Diseño, Simulación y Seguridad de Redes Inalámbricas para CubeSats y CanSat Educativos**
Objeto Digital de Conocimiento (ODC) alineado con el Modelo Educativo Digital Transmoderno (MEDIT) · Universidad de Cundinamarca

| | |
|---|---|
| **Autores** | Esteban Morales Aguilar · Darikson Felipe Pérez Rodríguez |
| **Programa** | Especialización en Infraestructura y Seguridad de Redes |
| **Grupo de CTI** | CAI2272024210 / CTI-IIPA2026-G8 |
| **Docente** | Jonathan Alejandro Nino Jaramillo |
| **Año / Licencia** | 2026 · Creative Commons BY-NC-SA 4.0 |

El ODC reúne tres módulos —**marco teórico**, **dashboard** (misión en vivo + simulador de red) y **guías técnicas**— más el **video del despliegue** del satélite ESTRATOSAT-TELCO. El aprendizaje es por exploración autónoma: **no hay evaluaciones, puntajes, insignias ni secuencias obligatorias**.

---

## Inicio rápido (local)

Requisitos: Docker 24+ con Compose v2 y ~6 GB de RAM libres.

```bash
cp .env.example .env        # (make up lo hace por usted)
make up                     # construye y levanta todo
make seed                   # sube a MinIO los PDF de las guías técnicas
```

| Qué | Dónde |
|---|---|
| Sitio (ODC) | http://localhost |
| Grafana (admin / `GRAFANA_PASSWORD`) | http://localhost:3000 |
| Panel de Traefik (solo desarrollo) | http://localhost:8080 |
| Swagger/OpenAPI de cada servicio | `make up-dev` y abrir `:3001/api/docs`, `:3002`, `:3005`; FastAPI en `:3003/docs`, `:3004/docs` |

Con `TELEMETRY_DEMO=true` (valor por defecto) el telemetry-service emite un **vuelo HAB simulado** (ascenso a 30 km y descenso, atmósfera ISA, enlace LoRa por FSPL), de modo que el dashboard funciona sin hardware. En una misión real ponga `TELEMETRY_DEMO=false` y publique la telemetría con `POST /api/v1/telemetry` (cabecera `X-API-Key`) o en la cola RabbitMQ `telemetry`.

Usuario administrador inicial: `ADMIN_EMAIL` / `ADMIN_PASSWORD` de su `.env` (**cámbielos**).

## Arquitectura

```
Navegador ──HTTPS──▶ Traefik (rate limit 100 req/min/IP · TLS · CSP)
                      ├─ /                    → frontend (React + Vite, servido por nginx)
                      ├─ /api/v1/auth, users  → auth-service       NestJS   :3001 → PostgreSQL
                      ├─ /api/v1/content      → content-service    NestJS   :3002 → MongoDB + Redis
                      ├─ /api/v1/telemetry,ws → telemetry-service  FastAPI  :3003 → TimescaleDB + RabbitMQ
                      ├─ /api/v1/simulation   → simulation-service FastAPI  :3004 → Redis (caché)
                      └─ /api/v1/media        → media-service      NestJS   :3005 → MinIO (S3)
Observabilidad: Prometheus · Alertmanager · Grafana · Loki
```

Detalle y decisiones de diseño en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Estructura

```
spacenet-lab/
├── docker-compose.yml · .prod.yml · .dev.yml   # base, producción (TLS), puertos de depuración
├── Makefile · .env.example
├── .github/workflows/ci.yml · cd.yml           # lint, tests, build, Trivy, E2E · GHCR + despliegue
├── docs/                                       # ARCHITECTURE · API · DEPLOYMENT · CONTRIBUTING
├── infrastructure/                             # traefik · postgres · mongodb · timescaledb · prometheus
│                                               # alertmanager · grafana (dashboards) · loki
├── services/
│   ├── auth-service/        # NestJS + TypeORM: JWT 15 min / refresh 7 d con rotación, bcrypt 12, roles
│   ├── content-service/     # NestJS + Mongoose: marco teórico, guías, créditos, caché Redis, sanitización
│   ├── telemetry-service/   # FastAPI: TimescaleDB, WebSocket, RabbitMQ, simulador de vuelo
│   ├── simulation-service/  # FastAPI: balance de enlace, Doppler, cobertura, optimizador SF/BW
│   └── media-service/       # NestJS + MinIO: streaming con rangos, imágenes (sharp), PDF, URL firmadas
├── frontend/                # React 18 + Vite + TS + Tailwind, i18n es/en, PWA, tema claro/oscuro
├── scripts/                 # init-db · seed-data · healthcheck · generate_pdfs · set-acme-email
├── seed/media/pdfs/         # PDF de las 5 guías técnicas (se suben con `make seed`)
└── tests/                   # e2e (Playwright) · integration (smoke.sh) · unit (índice)
```

## Fórmulas implementadas (simulation-service)

| Modelo | Fórmula |
|---|---|
| Pérdida en espacio libre | `FSPL(dB) = 20·log10(d_km) + 20·log10(f_MHz) + 32.44` |
| Balance de enlace | `P_rx = P_tx + G_tx + G_rx − FSPL − L_misc` (L_misc incluye pérdida por clima) |
| Sensibilidad LoRa | `S = −174 + 10·log10(BW_Hz) + NF + SNR_min(SF)` |
| Doppler (LEO) | `f_d = (v_r / c) · f_c`, con `v = √(μ/(R+h))` |
| Cobertura | `min(alcance radio, √(2·R·h + h²))` (horizonte geométrico) |
| PDR estimado | sigmoide sobre el margen de enlace: 50 % con 0 dB, ≈98 % con +20 dB |

## Pruebas

```bash
make test     # unitarias: NestJS (jest), FastAPI (pytest), frontend (vitest) + build
make lint     # tsc --noEmit en todos los paquetes TS + ruff
make e2e      # Playwright contra el stack levantado (make up)
./tests/integration/smoke.sh   # login admin, rutas protegidas, telemetría
```

## Seguridad (resumen)

HTTPS obligatorio en producción (Let's Encrypt, redirección 80→443, TLS ≥ 1.2, HSTS) · rate limiting en el gateway (100 req/min/IP) y por ruta en auth (registro 5/min, login 10/min) · JWT con rotación de refresh tokens (se guardan solo hashes SHA-256; la reutilización de un token revocado cierra todas las sesiones) · bcrypt 12 rondas · el registro público siempre crea rol `visitante` · validación estricta de entrada (class-validator / Pydantic) · sanitización de HTML en contenido editable · Helmet + CSP estricto · CORS acotado · endpoint de ingesta protegido por API key en comparación de tiempo constante · identificadores de archivos validados contra *path traversal* · secretos solo por entorno · Trivy y auditoría de dependencias en CI.

## Alcance, supuestos y pendientes (léalo antes de publicar)

Este repositorio es completo y funcional, pero hay puntos que **usted debe completar con información que solo los autores poseen**:

1. **Referencias APA 7.** La base trae 14 entradas (las citadas en el marco teórico) con texto `[Completar referencia APA 7]`. El ODC debe listar 30: edite `services/content-service/src/seed/seed-data.ts` (o cree/edite vía API) y ejecute `make pdfs` para regenerar el PDF. El botón «Descargar referencias (PDF)» aparece solo cuando ese PDF existe en MinIO.
2. **Video y miniatura.** No se incluyen. Súbalos desde `/video` (como admin) o con `VIDEO=ruta.mp4 POSTER=ruta.png make seed`.
3. **Presupuesto de componentes.** Los totales (≈ $1.289.149 y ≈ $4.507.479 COP) son los de la investigación; las líneas por componente son una **estimación editable** y la última fila (*Estación terrena*) está calibrada para que sumen esos totales. Reemplácelas por sus cotizaciones reales en `seed-data.ts`.
4. **Contenido textual** del marco teórico y las guías: redactado a partir de los temas y referencias del enunciado; contrástelo con el documento del trabajo de grado.
5. **Alertmanager** viene sin receptor: configure correo o Slack en `infrastructure/alertmanager/alertmanager.yml`.
6. **Trazabilidad distribuida (OpenTelemetry)** y el dashboard de CPU/memoria por contenedor (requiere cAdvisor) **no** están incluidos; hay métricas Prometheus, logs JSON en Loki y dashboards de salud/telemetría.
7. **Desviaciones deliberadas del enunciado**: WebSocket nativo en vez de `socket.io-client` (el backend FastAPI usa WebSocket estándar); tema claro/oscuro propio (Zustand) en lugar de `next-themes` (pensado para Next.js); componentes propios en lugar de shadcn/ui; Chart.js (no Recharts); E2E con Playwright (no Cypress); logs JSON con el logger de Nest en vez de Winston.
8. **Probado aquí:** tests unitarios, tipos y *build* de todos los servicios y del frontend, y validación sintáctica de Compose/workflows. **No** se pudo levantar el stack completo con Docker en el entorno de generación: haga `make up && ./tests/integration/smoke.sh` antes de publicar.

## Documentación

[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · [`docs/API.md`](docs/API.md) · [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) (local, VPS, AWS ECS, GCP Cloud Run, Azure Container Apps) · [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md)

## Licencia

Contenido y código bajo [Creative Commons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
