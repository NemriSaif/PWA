import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Chantier } from '../../chantier/schemas/chantier.schema';


@Schema({ timestamps: true })
export class Vehicule extends Document {
  @Prop({ required: true })
  immatriculation: string;

  @Prop()
  marque: string;

  @Prop()
  modele: string;

  @Prop()
  type: string;

  @Prop()
  kilometrage: number;

  @Prop({ type: Types.ObjectId, ref: 'Chantier' })
  chantier: Chantier;
}

export const VehiculeSchema = SchemaFactory.createForClass(Vehicule);
