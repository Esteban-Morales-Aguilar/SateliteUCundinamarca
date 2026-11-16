import { useEffect, useRef, useState } from 'react';
import { telemetryService } from '../services/telemetry.service';
import type { TelemetryPoint } from '../types';

const MAX_POINTS = 120;

/** WebSocket de telemetría con reconexión (backoff exponencial) y precarga del histórico. */
export function useTelemetry() {
  const [latest, setLatest] = useState<TelemetryPoint | null>(null);
  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [connected, setConnected] = useState(false);
  const retry = useRef(0);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    telemetryService.history(MAX_POINTS).then((h) => { if (!closed) { setHistory(h); if (h.length) setLatest(h[h.length - 1]); } }).catch(() => undefined);

    const connect = () => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      ws = new WebSocket(`${proto}://${location.host}/api/v1/ws/telemetry`);
      ws.onopen = () => { setConnected(true); retry.current = 0; };
      ws.onmessage = (e) => {
        try {
          const p = JSON.parse(e.data) as TelemetryPoint;
          setLatest(p);
          setHistory((prev) => [...prev, p].slice(-MAX_POINTS));
        } catch { /* mensaje inválido */ }
      };
      ws.onclose = () => {
        setConnected(false);
        if (closed) return;
        timer = setTimeout(connect, Math.min(1000 * 2 ** retry.current++, 30000));
      };
      ws.onerror = () => ws?.close();
    };
    connect();
    return () => { closed = true; if (timer) clearTimeout(timer); ws?.close(); };
  }, []);

  return { latest, history, connected };
}
