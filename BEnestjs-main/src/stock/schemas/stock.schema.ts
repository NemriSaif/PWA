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

  @Prop({ type: Types.ObjectId, ref: 'Chantier' })
  chantier: Types.ObjectId;

  @Prop()
  minQuantity: number; // Alert threshold

  @Prop()
  note: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId; // Supplier who owns this stock item

  @Prop({ default: 0 })
  price: number; // Price per unit

  @Prop({ type: Types.ObjectId, ref: 'Stock' })
  sourceStockId?: Types.ObjectId; // For managers: reference to original supplier's stock item

  @Prop({ type: Types.ObjectId, ref: 'User' })
  sourceSupplier?: Types.ObjectId; // For managers: reference to original supplier
}

export const StockSchema = SchemaFactory.createForClass(Stock);
