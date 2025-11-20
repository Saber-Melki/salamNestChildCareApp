import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly password: string;

    // the role selected in the UI
  @IsOptional()
  @IsIn(['admin', 'staff', 'parent'])
  role?: 'admin' | 'staff' | 'parent';
}

export class PostLoginResponse {
  @ApiProperty()
  readonly accessToken: string;

  @ApiProperty()
  readonly refreshToken: string;

  @ApiProperty()
  readonly role: string;

  // ✅ allow controller to return a message as you do now
  @ApiProperty({ required: false })
  readonly message?: string;
}

export class GetRefreshResponse {
  @ApiProperty()
  readonly accessToken: string;
}
