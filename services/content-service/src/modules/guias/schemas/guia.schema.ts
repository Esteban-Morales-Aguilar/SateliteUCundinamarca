import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'guias' })
export class Guia extends Document {
  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [{ step: Number, title: String, body: String }], default: [] })
  steps: Array<{ step: number; title: string; body: string }>;

  @Prop({ type: [String], default: [] })
  code: string[];

  @Prop({ default: '' })
  pdfUrl: string;

  @Prop({ default: 0 })
  order: number;
}

export const GuiaSchema = SchemaFactory.createForClass(Guia);
GuiaSchema.index({ title: 'text', description: 'text' });
