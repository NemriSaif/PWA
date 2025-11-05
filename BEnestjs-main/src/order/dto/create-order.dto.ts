import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { OrderStatus } from '../schemas/order.schema';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  stockItem: string; // Stock item ID

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsDateString()
  deliveryDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
