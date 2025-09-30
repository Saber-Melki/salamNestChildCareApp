import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { PayloadToken } from '../models/token.model';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);

    // Retourner role + tokens + message
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: data.role, // <-- rôle réel pour RBAC
      message: 'Login successful',
    };
  }

  @MessagePattern({ cmd: 'logout' })
  logout(@Payload() user: PayloadToken) {
    return this.authService.logout(user);
  }

  @MessagePattern({ cmd: 'refresh' })
  refresh(@Payload() user: PayloadToken) {
    return this.authService.createAccessTokenFromRefreshToken(user);
  }

  @MessagePattern({ cmd: 'validate_refresh_token' })
  validateRefreshToken(
    @Payload() payload: { refreshToken: string; userId: string },
  ) {
    return this.authService.validateRefreshToken(payload.refreshToken, payload.userId);
  }
}
