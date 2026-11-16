"""Hub WebSocket: difunde cada punto de telemetría a los clientes conectados."""
import asyncio
import json

from fastapi import WebSocket

PER_IP_LIMIT = 5


class ConnectionHub:
    def __init__(self) -> None:
        self.clients: set[WebSocket] = set()
        self.client_hosts: dict[WebSocket, str] = {}
        self.ip_counts: dict[str, int] = {}
        self.last: dict | None = None

    def can_connect(self, host: str) -> bool:
        if len(self.clients) >= 100:
            return False
        # Mientras el edge no propague la IP real, todos llegan como loopback.
        # En ese caso aplicamos solo el tope global para no bloquear el panel.
        if host in ("127.0.0.1", "::1", "unknown"):
            return True
        if self.ip_counts.get(host, 0) >= PER_IP_LIMIT:
            return False
        return True

    async def connect(self, ws: WebSocket, host: str = "unknown") -> None:
        await ws.accept()
        self.clients.add(ws)
        self.client_hosts[ws] = host
        self.ip_counts[host] = self.ip_counts.get(host, 0) + 1
        if self.last:
            try:
                await asyncio.wait_for(ws.send_text(json.dumps(self.last, default=str)), timeout=5)
            except Exception:
                self.disconnect(ws, host)

    def disconnect(self, ws: WebSocket, host: str | None = None) -> None:
        self.clients.discard(ws)
        h = host or self.client_hosts.pop(ws, None)
        if h is not None:
            if h in self.ip_counts and self.ip_counts[h] > 0:
                self.ip_counts[h] -= 1
            self.client_hosts.pop(ws, None)

    async def broadcast(self, data: dict) -> None:
        self.last = data
        msg = json.dumps(data, default=str)
        clients = list(self.clients)
        results = await asyncio.gather(
            *[self._safe_send(c, msg) for c in clients], return_exceptions=True
        )
        for c, r in zip(clients, results):
            if isinstance(r, Exception):
                self.disconnect(c, self.client_hosts.get(c))

    async def _safe_send(self, ws: WebSocket, msg: str) -> None:
        await asyncio.wait_for(ws.send_text(msg), timeout=5)