"""Consumidor RabbitMQ: la cola 'telemetry' recibe JSON de gateways y alimenta la ingesta."""
from __future__ import annotations

import asyncio
import json

import aio_pika
import structlog
from pydantic import ValidationError

from app.schemas.telemetry import TelemetryIn
from app.services.ingest import ingest

log = structlog.get_logger()
QUEUE = "telemetry"


async def consume(app, url: str) -> None:
    while True:  # reconexión con espera
        try:
            conn = await aio_pika.connect_robust(url)
            async with conn:
                ch = await conn.channel()
                await ch.set_qos(prefetch_count=50)
                queue = await ch.declare_queue(QUEUE, durable=True)
                log.info("rabbitmq_consumer_started", queue=QUEUE)
                async with queue.iterator() as it:
                    async for msg in it:
                        async with msg.process(requeue=False):
                            try:
                                await ingest(app, TelemetryIn(**json.loads(msg.body)))
                            except (ValidationError, ValueError) as e:
                                log.warning("invalid_message", error=str(e)[:200])
        except asyncio.CancelledError:
            raise
        except Exception as e:  # noqa: BLE001
            log.warning("rabbitmq_unavailable_retrying", error=str(e))
            await asyncio.sleep(5)
