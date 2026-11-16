import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'guias', timestamps: true })
export class Guia {
  @Prop({ required: true, unique: true }) slug: string;
  @Prop({ required: true }) title: string;
  @Prop() description: string;
  @Prop({ type: [{ step: Number, title: String, body: String }], default: [] }) steps: { step: number; title: string; body: string }[];
  @Prop({ type: [String], default: [] }) code: string[];
  @Prop({ type: [{ category: String, item: String, economico: Number, premium: Number }], default: [] }) components: { category: string; item: string; economico: number; premium: number }[];
  @Prop() pdfUrl: string;
  @Prop({ default: 0 }) order: number;
}
export type GuiaDoc = HydratedDocument<Guia>;
export const GuiaSchema = SchemaFactory.createForClass(Guia);
GuiaSchema.index({ title: 'text', description: 'text' }, { default_language: 'spanish' });
