import { IsString, IsNumber, IsOptional, IsMongoId } from 'class-validator';

export class CreateStockDto {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsMongoId()
  @IsOptional()
  chantier?: string;

  @IsNumber()
  @IsOptional()
  minQuantity?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
