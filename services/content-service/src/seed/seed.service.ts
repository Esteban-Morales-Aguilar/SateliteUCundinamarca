import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MarcoTeorico, MarcoTeoricoDoc } from '../modules/marco-teorico/marco-teorico.schema';
import { Guia, GuiaDoc } from '../modules/guias/guias.schema';
import { Credito, CreditoDoc, Referencia, ReferenciaDoc } from '../modules/credits/credits.schema';
import { CREDITOS, GUIAS, MARCO_TEORICO, REFERENCIAS } from './seed-data';

/** Siembra el contenido del ODC solo si las colecciones están vacías (idempotente). */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly log = new Logger('Seed');
  constructor(
    @InjectModel(MarcoTeorico.name) private readonly mt: Model<MarcoTeoricoDoc>,
    @InjectModel(Guia.name) private readonly guias: Model<GuiaDoc>,
    @InjectModel(Credito.name) private readonly cred: Model<CreditoDoc>,
    @InjectModel(Referencia.name) private readonly refs: Model<ReferenciaDoc>,
  ) {}
  async onApplicationBootstrap(): Promise<void> {
    try {
      if (!(await this.mt.estimatedDocumentCount())) await this.mt.insertMany(MARCO_TEORICO);
      if (!(await this.guias.estimatedDocumentCount())) await this.guias.insertMany(GUIAS);
      if (!(await this.cred.estimatedDocumentCount())) await this.cred.create(CREDITOS);
      if (!(await this.refs.estimatedDocumentCount())) await this.refs.insertMany(REFERENCIAS);
      this.log.log('Contenido inicial verificado');
    } catch (e) { this.log.warn(`Seed omitido: ${(e as Error).message}`); }
  }
}
