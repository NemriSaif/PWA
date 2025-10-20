import { IsString, IsNotEmpty, IsOptional, MinLength, Matches, Length, IsNumber } from 'class-validator';

export class CreatePersonnelDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[+]?[\d\s-()]+$/, { message: 'Invalid phone number format' })
  phone?: string;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsString()
  @IsOptional()
  @Length(8, 8, { message: 'CIN must be exactly 8 characters' })
  @Matches(/^\d{8}$/, { message: 'CIN must contain only 8 digits' })
  cin?: string;

}