# Tests unitarios

Los tests unitarios viven junto al código de cada servicio (convención de cada ecosistema):

| Componente | Ubicación | Comando |
|---|---|---|
| auth-service | `services/auth-service/src/**/*.spec.ts` | `npm test` |
| content-service | `services/content-service/src/**/*.spec.ts` | `npm test` |
| media-service | `services/media-service/src/**/*.spec.ts` | `npm test` |
| simulation-service | `services/simulation-service/tests/` | `python -m pytest` |
| telemetry-service | `services/telemetry-service/tests/` | `python -m pytest` |
| frontend | `frontend/src/**/*.test.ts(x)` | `npm test` |

`make test` ejecuta todos. Las pruebas E2E (`tests/e2e`, Playwright) y de integración (`tests/integration/smoke.sh`) requieren el stack arriba (`make up`).
