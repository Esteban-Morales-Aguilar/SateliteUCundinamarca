import { Controller, Get, Header } from '@nestjs/common';
import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import type { NextFunction, Request, Response } from 'express';

export const registry = new Registry();
collectDefaultMetrics({ register: registry });
const httpRequests = new Counter({ name: 'http_requests_total', help: 'Total de peticiones HTTP', labelNames: ['method', 'route', 'status'], registers: [registry] });
const httpDuration = new Histogram({ name: 'http_request_duration_seconds', help: 'Latencia HTTP', labelNames: ['method', 'route', 'status'], buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5], registers: [registry] });

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    const labels = { method: req.method, route: (req.route?.path as string | undefined) ?? 'unmatched', status: String(res.statusCode) };
    httpRequests.inc(labels);
    end(labels);
  });
  next();
}

@Controller('metrics')
export class MetricsController {
  @Get() @Header('Content-Type', registry.contentType)
  metrics(): Promise<string> { return registry.metrics(); }
}
