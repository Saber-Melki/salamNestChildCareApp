import {
  Inject,
  Injectable,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { PayloadToken } from '../models/token.model';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for: ${loginDto.email}`);

    // Appel au user-service
    const user = await firstValueFrom(
      this.userClient
        .send({ cmd: 'validate_user' }, loginDto)
        .pipe(timeout(5000)),
    ).catch((err) => {
      this.logger.error('[AuthService] validate_user call failed', err);
      return null;
    });

    if (!user) {
      this.logger.warn(`[AuthService] Invalid credentials for ${loginDto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.debug(`[AuthService] validate_user returned: ${JSON.stringify(user)}`);

    const userId = user.UserId ?? user.id ?? user.userId;
    const role = user.role ?? user.roles ?? user.roleName;

    if (!userId || !role) {
      this.logger.error('[AuthService] user-service returned user without id or role', { user });
      throw new InternalServerErrorException('User data incomplete from user-service');
    }

    const payload: PayloadToken = { role: role as any, userid: String(userId) };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Enregistrement du refresh token côté user-service
    const wasTokenSet = await firstValueFrom(
      this.userClient
        .send({ cmd: 'set_refresh_token' }, { userId: payload.userid, refreshToken })
        .pipe(timeout(5000)),
    ).catch((err) => {
      this.logger.error('[AuthService] set_refresh_token failed', err);
      return false;
    });

    if (!wasTokenSet) {
      this.logger.error(`[AuthService] Could not save refresh token for user ${payload.userid}`);
      throw new InternalServerErrorException('Could not complete login process.');
    }

    this.logger.log(`[AuthService] Login success for user ${payload.userid} role=${payload.role}`);

    return {
      id: payload.userid,
      email: user.email ?? null,
      role: payload.role,  // <-- le rôle réel est renvoyé ici
      accessToken,
      refreshToken,
    };
  }

  async logout(user: PayloadToken) {
    this.logger.log(`Logging out user ID: ${user.userid}`);
    return firstValueFrom(
      this.userClient
        .send({ cmd: 'remove_refresh_token' }, { userId: user.userid })
        .pipe(timeout(5000)),
    );
  }

  async validateRefreshToken(refreshToken: string, userId: string) {
    this.logger.log(`[AuthService] Validating refresh token for user ${userId}...`);
    return firstValueFrom(
      this.userClient
        .send({ cmd: 'validate_refresh_token' }, { refreshToken, userId })
        .pipe(timeout(5000)),
    );
  }

  createAccessTokenFromRefreshToken(user: PayloadToken) {
    this.logger.log(`Creating new access token for user ID: ${user.userid}`);
    const payload: PayloadToken = { role: user.role, userid: user.userid };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
    };
  }
}
