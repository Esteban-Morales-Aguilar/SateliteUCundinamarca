import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './common/health.controller';
import { MetricsController } from './common/metrics';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 600 }]), MediaModule],
  controllers: [HealthController, MetricsController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
