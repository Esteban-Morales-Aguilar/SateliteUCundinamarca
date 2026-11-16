import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/** Caché Redis con TTL por defecto de 1 hora (contenido cambia poco) */
@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly client: Redis | null = null;
  private readonly ttlSeconds = Number(process.env.CACHE_TTL ?? 3600);

  constructor() {
    const url = process.env.REDIS_URL;
    if (url) {
      try {
        this.client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 1 });
        this.client.connect().catch(() =>
          this.logger.warn('Redis no disponible, caché deshabilitado'),
        );
      } catch {
        this.logger.warn('REDIS_URL inválida, caché deshabilitado');
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    const raw = await this.client.get(key).catch(() => null);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttl = this.ttlSeconds): Promise<void> {
    if (!this.client) return;
    await this.client.set(key, JSON.stringify(value), 'EX', ttl).catch(() => undefined);
  }

  async del(pattern: string): Promise<void> {
    if (!this.client) return;
    const keys = await this.client.keys(pattern).catch(() => [] as string[]);
    if (keys.length) await this.client.del(...keys).catch(() => undefined);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.quit().catch(() => undefined);
  }
}
