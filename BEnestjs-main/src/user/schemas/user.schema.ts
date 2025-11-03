import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true, select: false }) // don't return by default
  password: string;

  @Prop({ default: 'USER' })
  role: string;

  @Prop()
  email?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);