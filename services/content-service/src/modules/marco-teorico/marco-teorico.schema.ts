import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'marco_teorico', timestamps: true })
export class MarcoTeorico {
  @Prop({ required: true, unique: true, trim: true }) slug: string;
  @Prop({ required: true, trim: true }) title: string;
  @Prop({ required: true }) content: string;
  @Prop({ type: [String], default: [] }) images: string[];
  @Prop({ type: [String], default: [] }) references: string[];
  @Prop({ default: 0 }) order: number;
  @Prop({ default: 1 }) version: number;
  @Prop({ type: [{ version: Number, title: String, content: String, at: Date }], default: [] })
  history: { version: number; title: string; content: string; at: Date }[];
}
export type MarcoTeoricoDoc = HydratedDocument<MarcoTeorico>;
export const MarcoTeoricoSchema = SchemaFactory.createForClass(MarcoTeorico);
MarcoTeoricoSchema.index({ title: 'text', content: 'text' }, { default_language: 'spanish' });
