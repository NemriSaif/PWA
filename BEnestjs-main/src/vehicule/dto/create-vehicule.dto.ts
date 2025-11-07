import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateVehiculeDto {
  @IsString()
  @IsNotEmpty()
  readonly immatriculation: string;

  @IsString()
  @IsOptional()
  readonly marque?: string;

  @IsString()
  @IsOptional()
  readonly modele?: string;

  @IsString()
  @IsOptional()
  readonly type?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  readonly kilometrage?: number;
}
