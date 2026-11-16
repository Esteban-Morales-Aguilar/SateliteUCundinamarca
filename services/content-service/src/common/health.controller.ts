import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly conn: Connection) {}
  @Get() health() {
    const up = this.conn.readyState === 1;
    return { status: up ? 'ok' : 'degraded', service: 'content-service', db: up ? 'up' : 'down', timestamp: new Date().toISOString() };
  }
}
