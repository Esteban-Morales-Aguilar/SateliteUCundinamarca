import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'marco_teorico' })
export class MarcoTeorico extends Document {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;   // HTML sanitizado

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  references: string[];

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: 1 })
  version: number;   // versionado simple del contenido
}

export const MarcoTeoricoSchema = SchemaFactory.createForClass(MarcoTeorico);
MarcoTeoricoSchema.index({ title: 'text', content: 'text' });
