import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import { LoginDto, PostLoginResponse, GetRefreshResponse } from '../dto/login.dto';
import { PayloadToken } from '../models/token.model';
import { PostRegisterResponse, RegisterDto } from '../dto/register.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyResetCodeDto,
} from '../dto/forgot-password.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  async login(
    @Payload() loginDto: LoginDto,
  ): Promise<PostLoginResponse & { role: string; id: string; email: string | null }> {
    const data = await this.authService.login(loginDto);
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: data.role,
      message: 'Login successful',
      id: data.id,
      email: data.email ?? null,
    };
  }

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() dto: RegisterDto): Promise<PostRegisterResponse> {
    return this.authService.register(dto);
  }

  @MessagePattern({ cmd: 'logout' })
  logout(@Payload() user: PayloadToken) {
    return this.authService.logout(user);
  }

  @MessagePattern({ cmd: 'refresh' })
  refresh(@Payload() user: PayloadToken): GetRefreshResponse {
    return this.authService.createAccessTokenFromRefreshToken(user);
  }

  @MessagePattern({ cmd: 'validate_refresh_token' })
  validateRefreshToken(@Payload() payload: { refreshToken: string; userId: string }) {
    return this.authService.validateRefreshToken(payload.refreshToken, payload.userId);
  }

  @MessagePattern({ cmd: 'forgot_password' })
  async forgotPassword(@Payload() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @MessagePattern({ cmd: 'verify_reset_code' })
  async verifyResetCode(@Payload() dto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(dto);
  }

  @MessagePattern({ cmd: 'reset_password' })
  async resetPassword(@Payload() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
