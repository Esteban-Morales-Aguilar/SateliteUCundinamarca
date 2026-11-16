import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Guia, GuiaSchema } from './schemas/guia.schema';
import { GuiasService } from './guias.service';
import { GuiasController } from './guias.controller';
import { RedisCacheService } from '../../common/redis-cache.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Guia.name, schema: GuiaSchema }])],
  controllers: [GuiasController],
  providers: [GuiasService, RedisCacheService],
  exports: [RedisCacheService],
})
export class GuiasModule {}
