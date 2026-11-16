# Guía para contribuir

## Flujo de trabajo

1. Cree una rama desde `develop`: `feat/…`, `fix/…`, `docs/…`.
2. Haga cambios pequeños y con pruebas. `make lint && make test` debe pasar.
3. Abra un *pull request* hacia `develop`. CI ejecuta lint, tests, build de imágenes, Trivy y E2E.
4. `main` despliega a *staging* automáticamente y a producción con aprobación manual (ver `docs/DEPLOYMENT.md`).

Commits en español o inglés, en imperativo y con prefijo: `feat(auth): …`, `fix(simulation): …`.

## Entorno de desarrollo

```bash
make up-dev                          # stack completo con puertos publicados
cd services/auth-service && npm ci && npm run start:dev   # un servicio fuera de Docker
cd frontend && npm ci && npm run dev                       # http://localhost:5173 (proxy /api → localhost:80)
```

Python 3.12 para FastAPI (`pip install -r requirements.txt`), Node 20 para NestJS y el frontend.

## Convenciones

- **TypeScript estricto**; DTO con `class-validator` en cada endpoint; nada de `any` sin justificar.
- **Python**: Pydantic para toda entrada; lógica de dominio en `core/` sin dependencias de FastAPI; `ruff` limpio.
- **Seguridad**: no registre secretos ni datos personales; valide identificadores y tipos de archivo; las rutas de escritura exigen `admin`.
- **Observabilidad**: logs JSON; una métrica o alerta nueva va acompañada de su panel/regla en `infrastructure/`.
- **Frontend**: accesibilidad WCAG 2.1 AA (contraste, foco visible, `aria-*`, teclado), textos en `src/i18n/*.json`, sin dependencias de pago.

## Lineamientos de contenido (MEDIT)

El ODC se basa en exploración autónoma. **No** se aceptan cambios que añadan cuestionarios, evaluaciones, puntajes, insignias, niveles, recompensas, actividades de arrastre o verdadero/falso, ni retroalimentación automática con puntaje. Tampoco secuencias obligatorias: toda sección debe ser accesible directamente.

Todo dato técnico nuevo debe citar su fuente; las referencias se mantienen en formato APA 7.

## Pruebas

Cada servicio tiene sus tests junto al código (índice en `tests/unit/README.md`). Un cambio de fórmulas en `simulation-service` requiere un test con valor de referencia calculado a mano. E2E: `make up && make e2e`.

## Licencia

Al contribuir acepta que su aporte se publique bajo CC BY-NC-SA 4.0.
