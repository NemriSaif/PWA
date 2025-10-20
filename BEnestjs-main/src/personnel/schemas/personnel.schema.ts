import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Chantier } from '../../chantier/schemas/chantier.schema';

@Schema({ timestamps: true })
export class Personnel extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  role: string;

  @Prop()
  phone: string;

  @Prop()
  cin: string;

  @Prop({ required: false, min: 0 })
  salary?: number;
  
  @Prop({ default: false })
  isPayed: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Chantier' })
  chantier: Chantier;
}

export const PersonnelSchema = SchemaFactory.createForClass(Personnel);
