# API

Base: `https://<dominio>/api/v1` (en local `http://localhost/api/v1`). JSON, UTF-8. Errores:

```json
{ "statusCode": 400, "message": ["email must be an email"], "timestamp": "2026-01-01T00:00:00.000Z" }
```

La especificación interactiva (OpenAPI) la genera cada servicio: con `make up-dev`, NestJS en `:PUERTO/api/docs` (auth 3001, content 3002, media 3005) y FastAPI en `:PUERTO/docs` (telemetry 3003, simulation 3004). `GET /health` y `GET /metrics` existen en cada servicio (en la raíz, no bajo `/api/v1`; no se exponen por el gateway).

**Autenticación:** `Authorization: Bearer <accessToken>` (15 min). **Roles:** `admin`, `docente`, `estudiante`, `visitante`. **Límites:** gateway 100 req/min/IP; `POST /auth/register` 5/min; `POST /auth/login` 10/min.

---

## auth-service

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/register` | público | `{email, name, password}` → crea **visitante**; devuelve `{user, accessToken, refreshToken, expiresIn}`. Contraseña: 8-72 caracteres, mayúscula, minúscula y número. |
| POST | `/auth/login` | público | `{email, password}` → mismos campos. |
| POST | `/auth/refresh` | público | `{refreshToken}` → nuevos tokens; el anterior queda revocado. Reutilizar uno revocado → 401 y se revocan todas las sesiones. |
| POST | `/auth/logout` | público | `{refreshToken}` → lo revoca. |
| GET | `/auth/me` | autenticado | Perfil. |
| GET | `/users` | admin | Lista usuarios. |
| GET | `/users/:id` | admin o el propio usuario | |
| PATCH | `/users/:id` | admin o el propio usuario | `{name?, email?, password?, role?}`; `role` solo lo aplica un admin. |
| DELETE | `/users/:id` | admin | |

## content-service

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/content/marco-teorico?page=&limit=&q=` | público | `{items, total, page, limit}`; `q` busca en texto (índice español). |
| GET | `/content/marco-teorico/:slug` | público | Sección completa. |
| POST | `/content/marco-teorico` | admin | `{slug, title, content, images?, references?, order?}`; el HTML se sanitiza. |
| PATCH | `/content/marco-teorico/:id` | admin | Guarda la versión previa en `history` y aumenta `version`. |
| DELETE | `/content/marco-teorico/:id` | admin | |
| GET | `/content/guias` · `/content/guias/:slug` | público | Guías con `steps`, `code`, `components` (4.1) y `pdfUrl`. |
| GET | `/content/creditos` | público | Autores, programa, universidad, grupo, docente, año, licencia y `references`. |
| GET | `/content/referencias` | público | Lista APA 7. |

Las lecturas se cachean en Redis (TTL 1 h) y se invalidan al escribir.

## telemetry-service

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/telemetry/latest?mission_id=` | público | Última lectura (404 si no hay). |
| GET | `/telemetry/history?mission_id=&start=&end=&limit=&bucket=` | público | `limit` 1-5000; `bucket=5min` lee el agregado continuo. |
| GET | `/telemetry/mission?mission_id=` | público | Datos de la misión. |
| POST | `/telemetry` | **`X-API-Key`** | Ingesta (201). Validada: altitud −500…120000 m, temp −120…90 °C, presión 0…1100 hPa, humedad 0…100 %, lat/lon, RSSI −160…0, SNR −30…30, PDR 0…1. 120/min. |
| WS | `/ws/telemetry` | público | Envía el último punto al conectar y cada punto nuevo (JSON). |

Cola RabbitMQ `telemetry` (durable): mensajes JSON con el mismo esquema que el POST.

Punto de telemetría:

```json
{ "time": "2026-05-01T15:04:05Z", "mission_id": "ESTRATOSAT-TELCO-01", "altitude": 12840.5,
  "temperature": -52.1, "pressure": 183.4, "humidity": 31.2, "latitude": 4.35, "longitude": -74.1,
  "rssi": -101.3, "snr": 4.2, "pdr": 0.94 }
```

## simulation-service

Todas son `POST`, JSON, con valores por defecto; fuera de rango → 422. Resultados cacheados por hash del cuerpo.

| Ruta | Entrada (principales) | Salida (principales) |
|---|---|---|
| `/simulation/link-budget` | `p_tx_dbm` (−10…30), `g_tx_dbi`, `g_rx_dbi`, `distance_km` (0…3000), `freq_mhz` (433/868/915), `sf` (7-12), `bw_khz` (125/250/500), `l_misc_db`, `climate` (despejado/nublado/lluvia/tormenta), `nf_db` | `fspl_db`, `p_rx_dbm`, `sensitivity_dbm`, `link_margin_db`, `pdr_estimated`, `viable`, `max_range_km`, `bitrate_bps`, `message`, `loss_curve[]` |
| `/simulation/doppler` | `altitude_km` (0…2000), `freq_mhz`, `elevation_deg` (0…90), `bw_khz`, `sf` | velocidad orbital, periodo, `doppler_shift_khz`, `lora_tolerance_khz`, `within_tolerance`, `pass_profile[]` |
| `/simulation/coverage` | los de link-budget + `altitude_km` | `radio_range_km`, `horizon_km`, `coverage_radius_km`, `coverage_area_km2`, `limited_by` |
| `/simulation/optimize` | potencia, ganancias, distancia, frecuencia, clima, `target_margin_db` | `recommended` (SF/BW de mayor tasa con margen suficiente o `null`), `candidates[]`, `message` |

## media-service

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/media/video/:id` | público | Streaming con `Range` (200 / 206 / 416), `ETag`, `Cache-Control`. |
| GET | `/media/video/:id/signed-url` | público | URL firmada temporal (15 min). |
| GET | `/media/images/:id` | público | Imagen (WebP optimizado). |
| GET | `/media/pdfs/:id` | público | PDF como descarga. |
| GET | `/media/exists/:kind/:id` | público | `{exists}`; `kind` = `video` \| `images` \| `pdfs`. |
| GET | `/media/list/:kind` | público | Lista de objetos. |
| POST | `/media/upload` | admin | `multipart/form-data` con `kind`, `id` y **después** `file`. Valida MIME; las imágenes se redimensionan (≤1920 px) y pasan a WebP; los PDF se comprueban. Máx. 500 MB. |
| DELETE | `/media/:id` | admin | Elimina el archivo. |

Identificadores: `[A-Za-z0-9._-]`, hasta 128 caracteres, sin barras.

### Identificadores usados por el ODC

`estratosat-telco-despliegue.mp4` (video) · `estratosat-telco-miniatura.webp` (imagen) · `guia-1-componentes.pdf` … `guia-5-lanzamiento.pdf` · `referencias-apa7.pdf`.
