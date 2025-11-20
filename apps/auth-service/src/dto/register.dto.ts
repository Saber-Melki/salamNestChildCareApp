// apps/auth-service/src/dto/register.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../models/roles.model';

// convenient alias for API responses
export type RoleString = 'parent' | 'staff' | 'admin';

export class RegisterDto {
  @ApiProperty() @IsEmail() @IsNotEmpty() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty() @IsString() @IsNotEmpty() firstName: string;
  @ApiProperty() @IsString() @IsNotEmpty() lastName: string;

  @ApiPropertyOptional({ enum: Role, default: Role.PARENT })
  @IsOptional() @IsEnum(Role) role?: Role;

  @ApiPropertyOptional() @IsOptional() @IsString() organizationId?: string;
}

export class PostRegisterResponse {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly email: string;

  // ✅ change enum → string union
  @ApiProperty({ enum: ['parent', 'staff', 'admin'] })
  readonly role: RoleString;

  @ApiProperty({ required: false }) readonly accessToken?: string;
  @ApiProperty({ required: false }) readonly refreshToken?: string;
  @ApiProperty() readonly message: string;
}
