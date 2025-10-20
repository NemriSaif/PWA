import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, IsEnum, IsBoolean, IsDateString } from 'class-validator';

export class PersonnelAssignmentDto {
  @IsString()
  @IsNotEmpty()
  personnel: string;

  @IsBoolean()
  @IsOptional()
  isPayed?: boolean;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class VehiculeAssignmentDto {
  @IsString()
  @IsNotEmpty()
  vehicule: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class FuelCostDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  vehicule?: string; // Vehicle ID reference

  @IsEnum(['cash', 'credit_card', 'check', 'other'])
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateDailyAssignmentDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  chantier: string;

  @IsArray()
  @IsOptional()
  personnelAssignments?: PersonnelAssignmentDto[];

  @IsArray()
  @IsOptional()
  vehiculeAssignments?: VehiculeAssignmentDto[];

  @IsArray()
  @IsOptional()
  fuelCosts?: FuelCostDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}