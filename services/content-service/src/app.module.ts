import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheService } from './common/cache.service';
import { AdminGuard } from './common/admin.guard';
import { HealthController } from './common/health.controller';
import { MetricsController } from './common/metrics';
import { MarcoTeorico, MarcoTeoricoSchema } from './modules/marco-teorico/marco-teorico.schema';
import { MarcoTeoricoController } from './modules/marco-teorico/marco-teorico.controller';
import { MarcoTeoricoService } from './modules/marco-teorico/marco-teorico.service';
import { Guia, GuiaSchema } from './modules/guias/guias.schema';
import { GuiasController } from './modules/guias/guias.controller';
import { GuiasService } from './modules/guias/guias.service';
import { Credito, CreditoSchema, Referencia, ReferenciaSchema } from './modules/credits/credits.schema';
import { CreditsController } from './modules/credits/credits.controller';
import { CreditsService } from './modules/credits/credits.service';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    JwtModule.register({}),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/spacenet'),
    MongooseModule.forFeature([
      { name: MarcoTeorico.name, schema: MarcoTeoricoSchema }, { name: Guia.name, schema: GuiaSchema },
      { name: Credito.name, schema: CreditoSchema }, { name: Referencia.name, schema: ReferenciaSchema },
    ]),
  ],
  controllers: [MarcoTeoricoController, GuiasController, CreditsController, HealthController, MetricsController],
  providers: [CacheService, AdminGuard, MarcoTeoricoService, GuiasService, CreditsService, SeedService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
