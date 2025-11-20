import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '../services/auth.service';
import {
  LoginDto,
  PostLoginResponse,
  GetRefreshResponse,
} from '../dto/login.dto';
import { RegisterDto, PostRegisterResponse } from '../dto/register.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dto/forgot-password.dto';
import { PayloadToken } from '../models/token.model';

@ApiTags('Auth')
@Controller('auth')
export class AuthHttpController {
  constructor(
    private readonly auth: AuthService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login (returns access & refresh tokens)' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login result with tokens',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Login successful' },
        id: { type: 'string', example: '20' },
        email: { type: 'string', nullable: true, example: 'parent.doe@example.com' },
        role: { type: 'string', example: 'parent' },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  async httpLogin(
    @Body() dto: LoginDto,
  ): Promise<
    PostLoginResponse & {
      role: string;
      id: string;
      email: string | null;
      message: string;
    }
  > {
    // ⚠️ AuthService.login must return at least:
    // { id, email, role, accessToken, refreshToken, (optional) message }
    const data: any = await this.auth.login(dto);

    return {
      // whatever AuthService.login returns (tokens, role, id, email…)
      ...data,
      // ensure message is always present for the client
      message: data.message ?? 'Login successful',
    };
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  async httpRegister(
    @Body() dto: RegisterDto,
  ): Promise<PostRegisterResponse> {
    return this.auth.register(dto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  async httpForgot(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reset password using token received by email',
  })
  @ApiBody({ type: ResetPasswordDto })
  async httpReset(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Get('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create new access token from a valid refresh token',
  })
  @ApiOkResponse({
    description: 'New access token',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  async httpRefresh(
    @Headers('x-refresh-token') refreshToken?: string,
    @Headers('x-user-id') userIdHeader?: string,
  ): Promise<GetRefreshResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing x-refresh-token header');
    }

    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    let payload: PayloadToken;
    try {
      payload = this.jwt.verify<PayloadToken>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (userIdHeader && userIdHeader !== payload.userid) {
      throw new UnauthorizedException('Token/user mismatch');
    }

    const isValid = await this.auth.validateRefreshToken(
      refreshToken,
      payload.userid,
    );
    if (!isValid) {
      throw new UnauthorizedException(
        'Refresh token not recognized (logged out or rotated)',
      );
    }

    return this.auth.createAccessTokenFromRefreshToken(payload);
  }

  @Get('logout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Logout (invalidates refresh token server-side)',
  })
  @ApiBearerAuth()
  async httpLogout(
    @Headers('authorization') authHeader?: string,
  ): Promise<any> {
    const token = extractBearer(authHeader);
    if (!token) {
      throw new UnauthorizedException(
        'Missing Authorization: Bearer <token>',
      );
    }

    const secret = this.config.get<string>('JWT_SECRET');
    let payload: PayloadToken;
    try {
      payload = this.jwt.verify<PayloadToken>(token, { secret });
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    return this.auth.logout(payload);
  }
}

function extractBearer(authorization?: string): string | null {
  if (!authorization) return null;
  const [type, token] = authorization.split(' ');
  if (!type || type.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}
