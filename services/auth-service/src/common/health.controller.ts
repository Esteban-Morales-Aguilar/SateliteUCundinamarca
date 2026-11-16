import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}
  @Get()
  async health() {
    let db = 'down';
    try { await this.ds.query('SELECT 1'); db = 'up'; } catch { /* degradado */ }
    return { status: db === 'up' ? 'ok' : 'degraded', service: 'auth-service', db, timestamp: new Date().toISOString() };
  }
}
