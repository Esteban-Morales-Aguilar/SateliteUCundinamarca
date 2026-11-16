import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guia, GuiaDoc } from './guias.schema';
import { CacheService } from '../../common/cache.service';

@Injectable()
export class GuiasService {
  constructor(@InjectModel(Guia.name) private readonly model: Model<GuiaDoc>, private readonly cache: CacheService) {}
  list() { return this.cache.wrap('content:guias:list', () => this.model.find().sort({ order: 1 }).lean()); }
  async bySlug(slug: string) {
    const g = await this.cache.wrap(`content:guias:${slug}`, () => this.model.findOne({ slug }).lean());
    if (!g) throw new NotFoundException('Guía no encontrada');
    return g;
  }
}
