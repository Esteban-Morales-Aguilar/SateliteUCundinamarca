import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Creditos, CreditosSchema, Referencia, ReferenciaSchema } from './schemas/creditos.schema';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Creditos.name, schema: CreditosSchema },
      { name: Referencia.name, schema: ReferenciaSchema },
    ]),
  ],
  controllers: [CreditsController],
  providers: [CreditsService],
})
export class CreditsModule {}
