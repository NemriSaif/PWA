import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Fournisseur extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  contact: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  address: string;

  @Prop()
  category: string; // e.g., "Materials", "Fuel", "Tools"

  @Prop()
  note: string;
}

export const FournisseurSchema = SchemaFactory.createForClass(Fournisseur);
