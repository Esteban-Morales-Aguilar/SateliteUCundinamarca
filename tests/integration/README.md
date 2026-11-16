# Tests de integración

Requieren el stack completo levantado (`make up` + `make seed`).

Sugeridos:
- POST /api/v1/auth/register → login → /me con el access token.
- POST /api/v1/telemetry (batch) → GET /api/v1/telemetry/latest devuelve el punto.
- POST /api/v1/media/upload/video/test.mp4 → GET /api/v1/media/video/test.mp4 con Range.
- WS /api/v1/ws/telemetry recibe un punto por segundo.

Ejecutar con: pytest tests/integration/ o Newman contra el OpenAPI exportado.
