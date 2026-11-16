import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MarcoTeorico, MarcoTeoricoDoc } from './marco-teorico.schema';
import { CreateMarcoDto, ListQueryDto, UpdateMarcoDto } from './marco-teorico.dto';
import { CacheService } from '../../common/cache.service';
import { sanitize } from '../../common/sanitize';

const PREFIX = 'content:mt:';

@Injectable()
export class MarcoTeoricoService {
  constructor(@InjectModel(MarcoTeorico.name) private readonly model: Model<MarcoTeoricoDoc>, private readonly cache: CacheService) {}

  list(q: ListQueryDto) {
    const { page = 1, limit = 20, q: text } = q;
    return this.cache.wrap(`${PREFIX}list:${page}:${limit}:${text ?? ''}`, async () => {
      const filter = text ? { $text: { $search: text } } : {};
      const [items, total] = await Promise.all([
        this.model.find(filter, { history: 0 }).sort({ order: 1 }).skip((page - 1) * limit).limit(limit).lean(),
        this.model.countDocuments(filter),
      ]);
      return { items, total, page, limit };
    });
  }
  async bySlug(slug: string) {
    const doc = await this.cache.wrap(`${PREFIX}slug:${slug}`, () => this.model.findOne({ slug }, { history: 0 }).lean());
    if (!doc) throw new NotFoundException('Sección no encontrada');
    return doc;
  }
  async create(dto: CreateMarcoDto) {
    if (await this.model.exists({ slug: dto.slug })) throw new ConflictException('El slug ya existe');
    const doc = await this.model.create({ ...dto, content: sanitize(dto.content) });
    await this.cache.invalidate(PREFIX);
    return doc;
  }
  /** Cada actualización guarda la versión previa en `history` y aumenta `version`. */
  async update(id: string, dto: UpdateMarcoDto) {
    const doc = await this.model.findById(id);
    if (!doc) throw new NotFoundException('Sección no encontrada');
    doc.history.push({ version: doc.version, title: doc.title, content: doc.content, at: new Date() });
    Object.assign(doc, dto, dto.content ? { content: sanitize(dto.content) } : {});
    doc.version += 1;
    await doc.save();
    await this.cache.invalidate(PREFIX);
    return doc;
  }
  async remove(id: string) {
    if (!(await this.model.findByIdAndDelete(id))) throw new NotFoundException('Sección no encontrada');
    await this.cache.invalidate(PREFIX);
    return { deleted: id };
  }
}
