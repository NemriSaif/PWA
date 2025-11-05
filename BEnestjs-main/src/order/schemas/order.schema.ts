import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  manager: Types.ObjectId; // Manager who placed the order

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  supplier: Types.ObjectId; // Supplier who receives the order

  @Prop({ type: Types.ObjectId, ref: 'Stock', required: true })
  stockItem: Types.ObjectId; // The stock item being ordered

  @Prop({ required: true })
  quantity: number; // Quantity ordered

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop()
  totalPrice: number; // Total price for this order

  @Prop()
  deliveryDate: Date;

  @Prop()
  notes: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
