# Arquitectura

## Vista general

```
┌────────────────────────────────────────────────────────────────┐
│ Navegador — React 18 + Vite + Tailwind (PWA)                   │
└───────────────────────────────┬────────────────────────────────┘
                                │ HTTPS / WSS
┌───────────────────────────────▼────────────────────────────────┐
│ Traefik v3 — enrutamiento por prefijo · rate limit · TLS · CSP  │
└──┬──────────┬───────────┬────────────┬───────────┬─────────────┘
   │          │           │            │           │
 auth       content    telemetry   simulation    media
 NestJS     NestJS     FastAPI     FastAPI       NestJS
 :3001      :3002      :3003       :3004         :3005
   │          │           │            │           │
Postgres   MongoDB    TimescaleDB    Redis       MinIO
   │          │       + RabbitMQ    (caché)     (S3)
   └─ Redis ──┘ (caché del contenido)
```

Observabilidad transversal: cada servicio expone `/metrics` (Prometheus) y `/health`; los logs van a stdout en JSON (Loki); Grafana tiene dashboards de salud de servicios y de telemetría; Alertmanager evalúa `ServiceDown` y `HighErrorRate`.

## Decisiones de diseño

| Decisión | Motivo |
|---|---|
| **Una base de datos por servicio** (PostgreSQL, MongoDB, TimescaleDB) | Cada una se ajusta al dato: usuarios relacionales, contenido documental versionable, telemetría como serie temporal. Los servicios no comparten esquema. |
| **Gateway con Traefik** y *labels* de Docker | Descubrimiento declarativo; el rate limit, los encabezados de seguridad y TLS viven en un solo lugar (`infrastructure/traefik/dynamic.yml`). |
| **JWT stateless + refresh con rotación** | content y media validan el access token con el secreto compartido sin llamar a auth. Los refresh se guardan como SHA-256; reutilizar uno revocado revoca todas las sesiones del usuario (detección de robo). |
| **Validación de roles en cada servicio** | `admin` para escribir contenido/medios y gestionar usuarios; el registro público solo crea `visitante` (sin escalada de privilegios). |
| **Caché con degradación elegante** | Redis acelera contenido (TTL 1 h) y simulaciones; si Redis cae, los servicios calculan/leen directo de la fuente y siguen respondiendo. |
| **Ingesta de telemetría unificada** | HTTP (con API key), cola RabbitMQ y simulador pasan por la misma función `ingest()`: persiste, actualiza métricas y difunde por WebSocket. |
| **Repositorio con *fallback* en memoria** | Si TimescaleDB no está disponible, la telemetría sigue fluyendo en memoria (útil en desarrollo y para no perder la vista en vivo). `/health` informa el almacenamiento activo. |
| **TimescaleDB** | *Hypertable*, compresión a los 7 días, retención de 90 días y agregado continuo `telemetry_5min` para gráficas históricas. |
| **Simulación sin estado** | Funciones puras en `core/` (testeables sin HTTP); la capa de servicio solo orquesta y cachea por hash del *payload*. |
| **Streaming con rangos** | media-service responde `206` con `Content-Range` leyendo de MinIO solo el tramo pedido (el usuario puede saltar en el video sin descargarlo entero). |
| **Contenido como datos, no como código** | El marco teórico y las guías viven en MongoDB y se editan por API, con versionado (historial por sección) y HTML sanitizado. |

## Patrones

API Gateway · Database-per-service · Cache-aside · Repository (telemetría) · Pub/Sub (WebSocket hub y RabbitMQ) · Graceful degradation · Fachada de dominio (`core/service.py`) separada del transporte HTTP · CQRS ligero (escrituras en la tabla; lecturas de dashboards desde el agregado continuo).

## Flujo de datos de telemetría

1. Gateway LoRa → `POST /api/v1/telemetry` (X-API-Key) **o** mensaje JSON en la cola `telemetry`.
2. `ingest()`: valida (Pydantic) → inserta en `telemetry` → actualiza gauges → `hub.broadcast()`.
3. El navegador, suscrito a `/api/v1/ws/telemetry`, recibe el último punto al conectar y cada punto nuevo; reconecta con *backoff* exponencial.
4. Los históricos salen de `GET /telemetry/history` (con `bucket=5min` para el agregado).

## Seguridad por capas

| Capa | Controles |
|---|---|
| Borde | TLS ≥ 1.2, HSTS, redirección 80→443, rate limit 100 req/min/IP, CSP estricto, `X-Frame-Options`, `nosniff`, `Referrer-Policy` |
| Servicios | Helmet, CORS acotado, `ValidationPipe` con `whitelist`/`forbidNonWhitelisted`, Pydantic con rangos físicos, filtros de excepción sin *stack traces*, límites por ruta (auth) |
| Datos | bcrypt 12, hashes de refresh, HTML sanitizado, IDs de archivo validados, MIME permitido por tipo, PDFs verificados |
| Operación | Servicios como usuario no root (imágenes multi-stage), secretos por entorno, Trivy (imágenes, fs, secretos, IaC), `npm audit`/`pip-audit` |

## Escalabilidad

Los servicios son stateless: `deploy.replicas` en `docker-compose.prod.yml` y Traefik balancea. El WebSocket del telemetry-service mantiene el hub **en memoria de cada réplica**; con varias réplicas, publique la telemetría en RabbitMQ con una cola por réplica (fan-out) o añada un bus Redis Pub/Sub antes de escalar horizontalmente ese servicio.
