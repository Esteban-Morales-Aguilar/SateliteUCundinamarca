import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'creditos' })
export class Credito {
  @Prop({ type: [{ name: String }], default: [] }) authors: { name: string }[];
  @Prop() program: string;
  @Prop() university: string;
  @Prop() researchGroup: string;
  @Prop() teacher: string;
  @Prop() year: number;
  @Prop() license: string;
}
export type CreditoDoc = HydratedDocument<Credito>;
export const CreditoSchema = SchemaFactory.createForClass(Credito);

@Schema({ collection: 'referencias' })
export class Referencia {
  @Prop({ required: true, unique: true }) citeKey: string;
  @Prop() topic: string;
  @Prop({ required: true }) apa: string;
}
export type ReferenciaDoc = HydratedDocument<Referencia>;
export const ReferenciaSchema = SchemaFactory.createForClass(Referencia);
