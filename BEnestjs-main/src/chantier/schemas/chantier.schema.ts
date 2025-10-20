import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Chantier extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  location: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

   @Prop()
  note: string;

 @Prop({
  type: [
    {
      personnel: { type: Types.ObjectId, ref: 'Personnel' }, // singular, matching TypeScript type
      date: Date,
    },
  ],
})
personnelAssignments: { personnel: Types.ObjectId; date: Date }[];

@Prop({
  type: [
    {
      vehicule: { type: Types.ObjectId, ref: 'Vehicule' },
      date: Date,
    },
  ],
})
vehiculeAssignments: { vehicule: Types.ObjectId; date: Date }[];

}

export const ChantierSchema = SchemaFactory.createForClass(Chantier);
