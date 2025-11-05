import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  MANAGER = 'manager',
  FOURNISSEUR = 'fournisseur',
  PERSONNEL = 'personnel',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop()
  phone?: string;

  @Prop()
  company?: string;

  @Prop({ default: null })
  resetPasswordToken?: string;

  @Prop({ default: null })
  resetPasswordExpires?: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
