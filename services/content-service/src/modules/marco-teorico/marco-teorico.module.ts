import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarcoTeorico, MarcoTeoricoSchema } from './schemas/marco-teorico.schema';
import { MarcoTeoricoService } from './marco-teorico.service';
import { MarcoTeoricoController } from './marco-teorico.controller';
import { RedisCacheService } from '../../common/redis-cache.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: MarcoTeorico.name, schema: MarcoTeoricoSchema }])],
  controllers: [MarcoTeoricoController],
  providers: [MarcoTeoricoService, RedisCacheService],
  exports: [RedisCacheService],
})
export class MarcoTeoricoModule {}
