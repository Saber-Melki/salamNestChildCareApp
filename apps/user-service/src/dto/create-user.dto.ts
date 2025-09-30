import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  PARENT = 'parent',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string; // The DTO receives a plain password, the service will hash it

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsOptional()
  url_img?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
