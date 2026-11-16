import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'creditos' })
export class Creditos extends Document {
  @Prop({ type: [{ name: String, email: String, orcid: String }], required: true })
  authors: Array<{ name: string; email: string; orcid?: string }>;

  @Prop({ required: true })
  program: string;

  @Prop({ required: true })
  university: string;

  @Prop({ required: true })
  researchGroup: string;

  @Prop({ required: true })
  teacher: string;

  @Prop({ required: true })
  year: number;

  @Prop({ default: 'CC BY-NC-SA 4.0' })
  license: string;
}

export const CreditosSchema = SchemaFactory.createForClass(Creditos);

@Schema({ timestamps: true, collection: 'referencias' })
export class Referencia extends Document {
  @Prop({ required: true, index: true })
  citeKey: string;

  @Prop({ required: true })
  apa: string;   // Referencia completa en formato APA 7

  @Prop({ default: '' })
  url: string;

  @Prop({ default: 'marco-teorico' })
  topic: string;
}

export const ReferenciaSchema = SchemaFactory.createForClass(Referencia);
ReferenciaSchema.index({ apa: 'text' });
