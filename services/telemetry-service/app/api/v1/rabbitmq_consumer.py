"""
Consumidor RabbitMQ (opcional): recibe paquetes de la estación terrena,
los inserta en TimescaleDB y los retransmite por WebSocket a los clientes.

Se lanza como tarea de fondo en el lifespan de FastAPI.
"""
import json
import aio_pika
from app.core.config import settings
from app.core.database import pool
from app.core.logging import logger
from app.api.v1.websocket import broadcast

QUEUE = "satellite.telemetry"


async def consume() -> None:
    try:
        connection = await aio_pika.connect_robust(settings.rabbitmq_url)
    except Exception as exc:  # noqa: BLE001
        logger.warning("RabbitMQ no disponible (%s) - consumidor deshabilitado", exc)
        return

    async with connection:
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=50)
        queue = await channel.declare_queue(QUEUE, durable=True)

        async with queue.iterator() as it:
            async for message in it:
                async with message.process():
                    try:
                        payload = json.loads(message.body)
                        await _persist(payload)
                        await broadcast(payload)
                    except Exception:  # noqa: BLE001
                        logger.exception("Error procesando mensaje de telemetría")


async def _persist(p: dict) -> None:
    async with pool().acquire() as conn:
        await conn.execute(
            "INSERT INTO telemetry (time, mission_id, altitude, temperature, pressure, "
            "humidity, latitude, longitude, rssi, snr, pdr) "
            "VALUES (now(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
            p.get("mission_id"), p.get("altitude"), p.get("temperature"),
            p.get("pressure"), p.get("humidity"), p.get("latitude"),
            p.get("longitude"), p.get("rssi"), p.get("snr"), p.get("pdr"),
        )
