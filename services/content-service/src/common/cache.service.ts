import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/** Caché con degradación elegante: si Redis falla se sirve desde Mongo. TTL 1 h. */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly log = new Logger('Cache');
  private redis?: Redis;
  static readonly TTL_S = 3600;
  constructor() {
    if (process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, enableOfflineQueue: false });
      this.redis.on('error', (e) => this.log.warn(`Redis no disponible: ${e.message}`));
    }
  }
  async wrap<T>(key: string, loader: () => Promise<T>, ttl = CacheService.TTL_S): Promise<T> {
    try { const hit = await this.redis?.get(key); if (hit) return JSON.parse(hit) as T; } catch { /* sin caché */ }
    const value = await loader();
    try { if (value != null) await this.redis?.set(key, JSON.stringify(value), 'EX', ttl); } catch { /* ignorar */ }
    return value;
  }
  async invalidate(prefix: string): Promise<void> {
    try { const keys = await this.redis?.keys(`${prefix}*`); if (keys?.length) await this.redis?.del(...keys); } catch { /* ignorar */ }
  }
  onModuleDestroy(): void { this.redis?.disconnect(); }
}
