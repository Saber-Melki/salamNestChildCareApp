// apps/api-gateway/src/auth/dto/register.dto.ts
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export enum GatewayRole {
  parent = 'parent',
  staff = 'staff',
  admin = 'admin',
}

@ApiSchema({ name: 'GW_RegisterDto' })
export class GW_RegisterDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    enum: GatewayRole,
    required: false,
    default: GatewayRole.parent,
  })
  @IsOptional()
  @IsEnum(GatewayRole)
  role?: GatewayRole;


}

@ApiSchema({ name: 'GW_ForgotPasswordDto' })
export class GW_ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@ApiSchema({ name: 'GW_ResetPasswordDto' })
export class GW_ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

/** Optional response shapes to improve Swagger */
@ApiSchema({ name: 'GW_PostRegisterResponse' })
export class GW_PostRegisterResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Object.values(GatewayRole) })
  role: string;

  @ApiProperty({ required: false })
  accessToken?: string;

  @ApiProperty({ required: false })
  refreshToken?: string;

  @ApiProperty()
  message: string;
}

@ApiSchema({ name: 'GW_VerifyResetCodeDto' })
export class GW_VerifyResetCodeDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: '6-digit code sent via email' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Code must be 6 digits' })
  code!: string;
}
