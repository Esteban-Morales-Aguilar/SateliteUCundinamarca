import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Credito, CreditoDoc, Referencia, ReferenciaDoc } from './credits.schema';
import { CacheService } from '../../common/cache.service';

@Injectable()
export class CreditsService {
  constructor(
    @InjectModel(Credito.name) private readonly creditos: Model<CreditoDoc>,
    @InjectModel(Referencia.name) private readonly refs: Model<ReferenciaDoc>,
    private readonly cache: CacheService,
  ) {}
  async getCreditos() {
    const [credito, references] = await Promise.all([this.cache.wrap('content:creditos', () => this.creditos.findOne().lean()), this.referencias()]);
    if (!credito) throw new NotFoundException('Créditos no configurados');
    return { ...credito, references };
  }
  referencias() { return this.cache.wrap('content:refs', () => this.refs.find().sort({ apa: 1 }).lean()); }
}
