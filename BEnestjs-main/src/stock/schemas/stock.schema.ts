import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Stock extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  unit: string; // e.g., "kg", "L", "pieces"

  @Prop()
  category: string; // e.g., "Materials", "Tools", "Fuel"

  @Prop({ type: Types.ObjectId, ref: 'Fournisseur' })
  fournisseur: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Chantier' })
  chantier: Types.ObjectId;

  @Prop()
  minQuantity: number; // Alert threshold

  @Prop()
  note: string;
}

export const StockSchema = SchemaFactory.createForClass(Stock);
