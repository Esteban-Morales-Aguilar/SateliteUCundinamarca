# Guía de despliegue

Variables: todas están en `.env.example`. **Antes de exponer el sitio cambie todos los secretos** (genere valores con `openssl rand -base64 48`): `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_PASSWORD`, claves de bases de datos, `REDIS_PASSWORD`, `RABBITMQ_PASSWORD`, `MINIO_SECRET_KEY`, `GRAFANA_PASSWORD`, `TELEMETRY_API_KEY`. `JWT_SECRET` debe tener ≥ 32 caracteres y ser **el mismo** en auth, content y media.

## 1. Local (Docker Compose)

```bash
git clone <repo> spacenet-lab && cd spacenet-lab
make up          # crea .env si falta y levanta todo (la primera construcción tarda varios minutos)
make health      # /health de cada servicio
make seed        # PDF de guías → MinIO (requiere ADMIN_PASSWORD en .env)
./tests/integration/smoke.sh
```

Sitio: http://localhost · Grafana: http://localhost:3000 · Traefik: http://localhost:8080.
Con `make up-dev` se publican además los puertos de cada servicio (Swagger, RabbitMQ en :15672, MinIO en :9001, Prometheus en :9090).

Video y miniatura: desde `/video` (inicie sesión como admin) o `VIDEO=./despliegue.mp4 POSTER=./miniatura.png make seed`.

Apagar: `make down` · **borrar datos**: `make clean`.

## 2. VPS (Ubuntu 22.04/24.04 + Docker + Traefik)

Requisitos: 2 vCPU / 4 GB RAM mínimo (8 GB con observabilidad completa), dominio con registro A hacia la IP del servidor.

```bash
# 1) Docker
curl -fsSL https://get.docker.com | sh && sudo usermod -aG docker $USER   # reingrese a la sesión

# 2) Firewall: solo SSH, HTTP (reto ACME + redirección) y HTTPS
sudo ufw allow OpenSSH && sudo ufw allow 80,443/tcp && sudo ufw enable

# 3) Código y configuración
sudo mkdir -p /opt/spacenet-lab && sudo chown $USER /opt/spacenet-lab
git clone <repo> /opt/spacenet-lab && cd /opt/spacenet-lab
cp .env.example .env && nano .env      # DOMAIN=odc.midominio.edu.co, ACME_EMAIL=…, todos los secretos, CORS_ORIGIN=https://odc.midominio.edu.co
sed -i 's/^TELEMETRY_DEMO=.*/TELEMETRY_DEMO=false/' .env   # en producción real; déjelo en true para una demo pública

# 4) Levantar con TLS
make prod        # escribe ACME_EMAIL en traefik.yml y usa docker-compose.prod.yml
make seed BASE_URL=https://odc.midominio.edu.co
```

`docker-compose.prod.yml`: enruta por `Host(DOMAIN)` solo en el entrypoint `websecure`, emite certificados Let's Encrypt, redirige todo el puerto 80 a HTTPS y **no publica** el panel de Traefik (:8080) ni Grafana (:3000). Para ver Grafana: `ssh -L 3000:localhost:3000 usuario@servidor` y publique temporalmente el puerto, o añádalo detrás de Traefik con autenticación.

Verificación: `curl -I https://$DOMAIN` (HSTS, CSP, `X-Frame-Options`) · `curl -I http://$DOMAIN` (301 → https) · SSL Labs.

### Operación

| Tarea | Comando |
|---|---|
| Actualizar | `git pull && make prod` |
| Logs | `docker compose logs -f --tail=200 <servicio>` |
| Reiniciar un servicio | `docker compose restart <servicio>` |
| Reaplicar init de BD | `make init-db` |

### Copias de seguridad (programe con cron)

```bash
docker compose exec -T postgres pg_dump -U spacenet spacenet | gzip > backup/pg-$(date +%F).sql.gz
docker compose exec -T timescaledb pg_dump -U spacenet telemetry | gzip > backup/ts-$(date +%F).sql.gz
docker compose exec -T mongo mongodump -u spacenet -p "$MONGO_PASSWORD" --authenticationDatabase admin --archive --gzip > backup/mongo-$(date +%F).archive.gz
docker run --rm -v spacenet-lab_minio_data:/data -v $PWD/backup:/b alpine tar czf /b/minio-$(date +%F).tgz -C /data .
```

Pruebe la restauración en un entorno aparte. Guarde las copias fuera del servidor.

### Alertas

Edite `infrastructure/alertmanager/alertmanager.yml` y descomente `email_configs` o `slack_configs`; luego `docker compose restart alertmanager`. Reglas actuales: `ServiceDown` (1 min) y `HighErrorRate` (>5 % de 5xx durante 5 min).

## 3. CI/CD con GitHub Actions

`ci.yml` se ejecuta en cada push/PR a `main` y `develop`. `cd.yml` (push a `main`) construye y publica 6 imágenes en GHCR (`ghcr.io/<owner>/<repo>/<servicio>`), despliega a *staging* por SSH y luego a producción.

Configure en GitHub → Settings:

- **Environments**: `staging` y `production`; en `production` active **Required reviewers** (aprobación manual).
- **Secrets**: `STAGING_HOST`, `PRODUCTION_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`.
- **Variables**: `STAGING_DOMAIN`, `PRODUCTION_DOMAIN`.
- En cada servidor: el repositorio clonado en `/opt/spacenet-lab` con su `.env` y su usuario con acceso a Docker.

## 4. Nube

> Las guías de esta sección son **orientativas**: describen el mapeo de componentes y los puntos delicados, pero no se probaron en estas plataformas. Pruebe en un entorno de ensayo antes de producción.

Los 5 servicios y el frontend son contenedores sin estado y se construyen con los Dockerfile de cada carpeta. En la nube se reemplazan los componentes de datos por servicios gestionados y Traefik por el balanceador de la plataforma.

| Componente local | Equivalente gestionado | Notas |
|---|---|---|
| PostgreSQL (auth) | RDS / Cloud SQL / Azure Database for PostgreSQL | Cualquiera; `DATABASE_URL`. |
| **TimescaleDB** | Timescale Cloud, o Azure Database for PostgreSQL (soporta la extensión), o VM/contenedor propio | **RDS y Cloud SQL no incluyen la extensión `timescaledb`.** Sin ella, `infrastructure/timescaledb/init.sql` falla; el servicio seguiría funcionando con su *fallback* en memoria pero sin persistencia. |
| MongoDB | MongoDB Atlas (recomendado) / Cosmos DB for MongoDB | DocumentDB tiene diferencias de compatibilidad (p. ej. índices de texto). |
| Redis | ElastiCache / Memorystore / Azure Cache for Redis | `REDIS_URL` con contraseña/TLS (`rediss://`). |
| RabbitMQ | Amazon MQ / CloudAMQP / contenedor propio | `RABBITMQ_URL`. Opcional si solo se usa HTTP. |
| MinIO | S3 / GCS (interoperabilidad S3) / MinIO en contenedor | media-service usa API S3: `MINIO_ENDPOINT=https://s3.<región>.amazonaws.com`, claves de acceso del bucket. Cree antes los buckets `spacenet-videos`, `spacenet-images`, `spacenet-pdfs`. |
| Traefik | ALB / HTTPS Load Balancer / Front Door | Reglas por prefijo de ruta (ver tabla); TLS en el balanceador. |

Reglas de enrutamiento (todas con *health check* en `/health`):

| Prefijo | Servicio (puerto) |
|---|---|
| `/api/v1/auth*`, `/api/v1/users*` | auth-service (3001) |
| `/api/v1/content*` | content-service (3002) |
| `/api/v1/telemetry*`, `/api/v1/ws*` | telemetry-service (3003) — **WebSocket** |
| `/api/v1/simulation*` | simulation-service (3004) |
| `/api/v1/media*` | media-service (3005) |
| `/*` | frontend (80) |

Todos los servicios leen su configuración de variables de entorno (ver `.env.example` y el `environment:` de `docker-compose.yml`); guarde los secretos en el gestor de la plataforma.

### AWS ECS (Fargate)

```bash
# Publicar imágenes (o use las de GHCR)
aws ecr create-repository --repository-name spacenet/auth-service        # repita por servicio
docker build -t $ACCT.dkr.ecr.$REGION.amazonaws.com/spacenet/auth-service:1 services/auth-service
docker push   $ACCT.dkr.ecr.$REGION.amazonaws.com/spacenet/auth-service:1
```

1. VPC con subredes privadas; RDS, ElastiCache y Amazon MQ en ellas; Atlas por *peering/PrivateLink*.
2. Un *task definition* por servicio (1 contenedor, puerto del servicio, secretos desde **Secrets Manager** → `secrets:`), un *ECS service* por *task* en Fargate con ≥ 2 réplicas (telemetry: ver nota de escalado en ARCHITECTURE).
3. **ALB** con certificado de ACM, *listener* 443 y reglas por ruta según la tabla; *target groups* tipo `ip` con *health check* `/health`. El ALB soporta WebSocket; suba el *idle timeout* (p. ej. 300 s).
4. Seguridad de red: *security groups* que solo permiten ALB → servicios y servicios → datos. WAF en el ALB para el rate limit (el de Traefik ya no existe).
5. Logs: `awslogs` → CloudWatch (o Loki). Métricas: Container Insights o Prometheus gestionado.

### GCP Cloud Run

```bash
gcloud artifacts repositories create spacenet --repository-format=docker --location=$REGION
gcloud builds submit services/auth-service --tag $REGION-docker.pkg.dev/$PROJECT/spacenet/auth-service
gcloud run deploy auth-service --image $REGION-docker.pkg.dev/$PROJECT/spacenet/auth-service \
  --region $REGION --port 3001 --min-instances 1 --allow-unauthenticated \
  --set-secrets JWT_SECRET=jwt-secret:latest,DATABASE_URL=auth-db-url:latest \
  --vpc-connector spacenet-conn
```

(En producción restrinja la invocación al balanceador con `--ingress internal-and-cloud-load-balancing`.) Repita por servicio con su puerto. Para el enrutamiento por ruta use un **Application Load Balancer externo** con *serverless NEG* por servicio y un *URL map* con los prefijos de la tabla. Notas: **telemetry-service** necesita `--min-instances 1 --no-cpu-throttling` (el simulador y el consumidor RabbitMQ corren en segundo plano) y `--timeout 3600` para WebSocket; Cloud SQL para PostgreSQL (sin TimescaleDB, ver arriba), Memorystore por *VPC connector*, Atlas o MongoDB en GCE, y GCS con claves HMAC como almacén S3 (`MINIO_ENDPOINT=https://storage.googleapis.com`).

### Azure Container Apps

```bash
az group create -n spacenet -l eastus
az containerapp env create -n spacenet-env -g spacenet -l eastus
az acr create -n spacenetacr -g spacenet --sku Basic && az acr build -r spacenetacr -t auth-service:1 services/auth-service
az containerapp create -n auth-service -g spacenet --environment spacenet-env \
  --image spacenetacr.azurecr.io/auth-service:1 --target-port 3001 --ingress internal \
  --min-replicas 1 --secrets jwt=$JWT_SECRET --env-vars JWT_SECRET=secretref:jwt NODE_ENV=production
```

Los servicios con `--ingress internal` quedan detrás de **Azure Front Door** o **Application Gateway** que aplica las reglas por ruta (o de una *container app* con nginx/Traefik como único ingress externo). **Azure Database for PostgreSQL Flexible Server** permite habilitar `timescaledb` (parámetro `azure.extensions`), lo que lo hace la opción más sencilla para telemetría en Azure. Cosmos DB for MongoDB o Atlas para el contenido; Azure Cache for Redis; MinIO como *container app* con volumen en Azure Files, o una capa S3-compatible.

## 5. Lista de verificación previa a publicar

- [ ] Todos los secretos cambiados; `.env` fuera del control de versiones.
- [ ] `DOMAIN`, `ACME_EMAIL` y `CORS_ORIGIN` correctos; HTTPS y redirección comprobados.
- [ ] `TELEMETRY_DEMO` definido a propósito (`false` si hay datos reales).
- [ ] Referencias APA completas (30), video y miniatura cargados, PDF de referencias generado (`make pdfs && make seed`).
- [ ] Presupuesto de componentes (guía 4.1) reemplazado por cotizaciones reales.
- [ ] Alertmanager con receptor configurado; copias de seguridad programadas y restauración probada.
- [ ] `make test`, `make e2e` y `tests/integration/smoke.sh` en verde.
