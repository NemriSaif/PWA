import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Chantier } from '../../chantier/schemas/chantier.schema';
import { Personnel } from '../../personnel/schemas/personnel.schema';
import { Vehicule } from '../../vehicule/schemas/vehicule.schema';

@Schema({ timestamps: true })
export class DailyAssignment extends Document {
  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'Chantier', required: true })
  chantier: Chantier;

  @Prop([{
    personnel: { type: Types.ObjectId, ref: 'Personnel' },
    isPayed: { type: Boolean, default: false },
    salary: { type: Number, default: 0 },
    notes: { type: String, default: '' }
  }])
  personnelAssignments: {
    personnel: Personnel;
    isPayed: boolean;
    salary: number;
    notes: string;
  }[];

  @Prop([{
    vehicule: { type: Types.ObjectId, ref: 'Vehicule' },
    notes: { type: String, default: '' }
  }])
  vehiculeAssignments: {
    vehicule: Vehicule;
    notes: string;
  }[];

  @Prop([{
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'credit_card', 'check', 'other'], default: 'cash' },
    notes: { type: String, default: '' }
  }])
  fuelCosts: {
    description: string;
    amount: number;
    paymentMethod: string;
    notes: string;
  }[];

  @Prop({ type: Number, default: 0 })
  totalPersonnelCost: number;

  @Prop({ type: Number, default: 0 })
  totalFuelCost: number;

  @Prop({ type: Number, default: 0 })
  totalCost: number;

  @Prop({ type: String, default: '' })
  notes: string;
}

export const DailyAssignmentSchema = SchemaFactory.createForClass(DailyAssignment);