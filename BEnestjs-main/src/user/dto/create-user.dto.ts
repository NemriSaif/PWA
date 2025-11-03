import { IsString, MinLength, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}