// apps/api-gateway/src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Get,
  Req,
  HttpCode,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Response, Request } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';

import { LoginDto } from './dto/login.dto';
import JwtRefreshGuard from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  GW_ForgotPasswordDto,
  GW_PostRegisterResponse,
  GW_RegisterDto,
  GW_ResetPasswordDto,
  GW_VerifyResetCodeDto,
} from './dto/register.dto';

type AuthLoginResponse = {
  accessToken: string;
  refreshToken: string;
  id: string;
  email: string | null;
  role: string;
  message?: string;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login (sets httpOnly cookies and returns tokens)' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login result with tokens and basic user info',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Login successful' },
        id: { type: 'string', example: '20' },
        email: {
          type: 'string',
          nullable: true,
          example: 'parent.doe@example.com',
        },
        role: { type: 'string', example: 'parent' },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // 🔁 Call auth-service via RMQ
    const tokens = (await firstValueFrom(
      this.authClient.send<AuthLoginResponse>({ cmd: 'login' }, loginDto),
    )) as AuthLoginResponse;

    // 🍪 Set httpOnly cookies (for your React app)
    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15min
    });
    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 🔙 ALSO return tokens in JSON body for Swagger / manual usage
    return {
      message: tokens.message ?? 'Login successful',
      id: tokens.id,
      email: tokens.email,
      role: tokens.role,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // 🔹 REGISTER
  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: GW_RegisterDto })
  async register(
    @Body() dto: GW_RegisterDto,
  ): Promise<GW_PostRegisterResponse> {
    return await firstValueFrom(
      this.authClient.send({ cmd: 'register' }, dto),
    );
  }

  // 🔹 FORGOT PASSWORD (send 6-digit code)
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request password reset code' })
  @ApiBody({ type: GW_ForgotPasswordDto })
  async forgotPassword(@Body() dto: GW_ForgotPasswordDto) {
    return await firstValueFrom(
      this.authClient.send({ cmd: 'forgot_password' }, dto),
    );
  }

  // 🔹 VERIFY RESET CODE (email + code → resetToken)
  @Post('verify-reset-code')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify emailed reset code and get reset token' })
  @ApiBody({ type: GW_VerifyResetCodeDto })
  async verifyResetCode(@Body() dto: GW_VerifyResetCodeDto) {
    return await firstValueFrom(
      this.authClient.send({ cmd: 'verify_reset_code' }, dto),
    );
  }

  // 🔹 RESET PASSWORD (final step, uses resetToken from previous step)
  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset password using reset token' })
  @ApiBody({ type: GW_ResetPasswordDto })
  async resetPassword(@Body() dto: GW_ResetPasswordDto) {
    return await firstValueFrom(
      this.authClient.send({ cmd: 'reset_password' }, dto),
    );
  }

  // 🔹 REFRESH ACCESS TOKEN (uses refresh cookie)
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = (request as any).user;
    const { accessToken } = await firstValueFrom(
      this.authClient.send({ cmd: 'refresh' }, user),
    );

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return { message: 'Access token refreshed', accessToken };
  }

  // 🔹 LOGOUT
  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @HttpCode(200)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = (request as any).user;
    await firstValueFrom(this.authClient.send({ cmd: 'logout' }, user));

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict' as const,
      path: '/',
    };

    response.clearCookie('access_token', cookieOpts);
    response.clearCookie('refresh_token', cookieOpts);

    return { message: 'Logout successful' };
  }
}
