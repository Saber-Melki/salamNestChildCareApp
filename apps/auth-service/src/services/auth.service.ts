import {
  Inject,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

import { LoginDto } from '../dto/login.dto';
import { PayloadToken } from '../models/token.model';
import { Role } from '../models/roles.model';
import { RegisterDto } from '../dto/register.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyResetCodeDto,
} from '../dto/forgot-password.dto';

type AnyUser = {
  id?: string | number;
  userId?: string | number;
  UserId?: string | number;
  user_id?: string | number;
  email?: string;
  role?: string;
  roles?: string[];
  roleName?: string;
};

const ROLE_MAP = new Map<string, 'admin' | 'staff' | 'parent'>([
  ['ADMIN', 'admin'],
  ['admin', 'admin'],
  ['STAFF', 'staff'],
  ['staff', 'staff'],
  ['PARENT', 'parent'],
  ['parent', 'parent'],
]);

function normalizeRoleString(user: AnyUser): 'admin' | 'staff' | 'parent' {
  if (user.role) {
    const key = String(user.role).trim().toUpperCase();
    const hit = ROLE_MAP.get(key);
    if (hit) return hit;
  }
  if (Array.isArray(user.roles) && user.roles.length) {
    const upper = user.roles.map((r) => String(r).toUpperCase());
    if (upper.includes('ADMIN')) return 'admin';
    if (upper.includes('STAFF')) return 'staff';
    if (upper.includes('PARENT')) return 'parent';
  }
  if (user.roleName) {
    const key = String(user.roleName).trim().toUpperCase();
    const hit = ROLE_MAP.get(key);
    if (hit) return hit;
  }
  throw new Error('Could not determine user role');
}

function toRoleEnum(str: 'admin' | 'staff' | 'parent'): Role {
  switch (str) {
    case 'admin':
      return Role.ADMIN;
    case 'staff':
      return Role.STAFF;
    case 'parent':
      return Role.PARENT;
  }
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private mailer?: nodemailer.Transporter;
  private readonly exposeResetLink: boolean;

  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 0);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    this.exposeResetLink =
      (this.config.get<string>('EXPOSE_RESET_LINK') ?? 'false') === 'true';

    // 🔍 Log what we see (without password) to be sure env loaded
    this.logger.log(
      `[AuthService] SMTP config – host=${host} port=${port} user=${user ? 'SET' : 'MISSING'} pass=${
        pass ? 'SET' : 'MISSING'
      }`,
    );

    if (host && port && user && pass) {
      this.mailer = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // for Mailtrap: 587 -> secure=false (OK)
        auth: { user, pass },
      });

      this.mailer
        .verify()
        .then(() =>
          this.logger.log(
            '[AuthService] SMTP transporter verified and ready (Mailtrap).',
          ),
        )
        .catch((e) => {
          this.logger.error('[AuthService] SMTP verify failed:', e);
          this.mailer = undefined;
        });
    } else {
      this.logger.warn(
        '[AuthService] SMTP not fully configured. Forgot/Reset will skip email send.',
      );
    }
  }

  // ---------------------------
  // Registration
  // ---------------------------
  async register(dto: RegisterDto) {
    const autoLogin =
      (this.config.get<string>('REGISTER_AUTO_LOGIN') ?? 'true') === 'true';

    const exists = await firstValueFrom(
      this.userClient
        .send<boolean>({ cmd: 'user_exists_by_email' }, { email: dto.email })
        .pipe(timeout(5000)),
    ).catch(() => false);

    if (exists) throw new ConflictException('Email is already registered');

    const createPayload = {
      first_name: dto.firstName,
      last_name: dto.lastName,
      email: dto.email?.trim().toLowerCase(),
      password: dto.password,
      role: (dto.role ?? Role.PARENT) as unknown as string,
    };

    const created: AnyUser | null = await firstValueFrom(
      this.userClient
        .send<any>({ cmd: 'create_user' }, createPayload)
        .pipe(timeout(5000)),
    ).catch((err) => {
      this.logger.error('[AuthService] create_user failed', err);
      throw new BadRequestException('Could not create user');
    });

    const createdId = String(
      created?.id ?? created?.user_id ?? created?.userId ?? created?.UserId ?? '',
    );
    if (!created || !createdId)
      throw new BadRequestException('User creation failed');

    if (!autoLogin) {
      const roleStr = normalizeRoleString({
        role: created.role ?? (dto.role as any) ?? 'parent',
      });
      return {
        id: createdId,
        email: created.email ?? dto.email,
        role: roleStr,
        message: 'Registration successful. Please log in.',
      };
    }

    const roleStr = normalizeRoleString({
      role: created.role ?? (dto.role as any) ?? 'parent',
    });
    const roleEnum = toRoleEnum(roleStr);
    const payload: PayloadToken = { userid: createdId, role: roleEnum };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const saved = await firstValueFrom(
      this.userClient
        .send<boolean>(
          { cmd: 'set_refresh_token' },
          { userId: payload.userid, refreshToken },
        )
        .pipe(timeout(5000)),
    ).catch(() => false);

    if (!saved) {
      this.logger.error(
        `[AuthService] Could not save refresh token for user ${payload.userid}`,
      );
      return {
        id: createdId,
        email: created.email ?? dto.email,
        role: roleStr,
        message: 'Registered. Please log in.',
      };
    }

    return {
      id: createdId,
      email: created.email ?? dto.email,
      role: roleStr,
      accessToken,
      refreshToken,
      message: 'Registration successful',
    };
  }

  // ---------------------------
  // Login (with role enforcement)
  // ---------------------------
  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for: ${loginDto.email}`);

    const user = await firstValueFrom(
      this.userClient
        .send<AnyUser>({ cmd: 'validate_user' }, loginDto)
        .pipe(timeout(5000)),
    ).catch((err) => {
      this.logger.error('[AuthService] validate_user call failed', err);
      return null;
    });

    if (!user) {
      this.logger.warn(
        `[AuthService] Invalid credentials for ${loginDto.email}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const userId = String(
      user.UserId ?? user.user_id ?? user.id ?? user.userId ?? '',
    );
    if (!userId) {
      this.logger.error(
        '[AuthService] user-service returned user without id',
        { user },
      );
      throw new InternalServerErrorException(
        'User data incomplete from user-service',
      );
    }

    const actualRole = normalizeRoleString(user); // 'admin' | 'staff' | 'parent'

    if (loginDto.role && loginDto.role !== actualRole) {
      this.logger.warn(
        `[AuthService] Role mismatch for ${loginDto.email}: selected=${loginDto.role}, actual=${actualRole}`,
      );
      throw new ForbiddenException('Selected role does not match your account');
    }

    const roleEnum = toRoleEnum(actualRole);
    const payload: PayloadToken = { userid: userId, role: roleEnum };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    const wasTokenSet = await firstValueFrom(
      this.userClient
        .send<boolean>(
          { cmd: 'set_refresh_token' },
          { userId: payload.userid, refreshToken },
        )
        .pipe(timeout(5000)),
    ).catch((err) => {
      this.logger.error('[AuthService] set_refresh_token failed', err);
      return false;
    });

    if (!wasTokenSet) {
      this.logger.error(
        `[AuthService] Could not save refresh token for user ${payload.userid}`,
      );
      throw new InternalServerErrorException(
        'Could not complete login process.',
      );
    }

    this.logger.log(
      `[AuthService] Login success for user ${payload.userid} role=${actualRole}`,
    );

    return {
      id: payload.userid,
      email: user.email ?? null,
      role: actualRole, // always the DB role
      accessToken,
      refreshToken,
    };
  }

  // ---------------------------
  // Logout
  // ---------------------------
  async logout(user: PayloadToken) {
    this.logger.log(`Logging out user ID: ${user.userid}`);
    return firstValueFrom(
      this.userClient
        .send({ cmd: 'remove_refresh_token' }, { userId: user.userid })
        .pipe(timeout(5000)),
    );
  }

  // ---------------------------
  // Validate refresh token
  // ---------------------------
  async validateRefreshToken(refreshToken: string, userId: string) {
    this.logger.log(
      `[AuthService] Validating refresh token for user ${userId}...`,
    );
    return firstValueFrom(
      this.userClient
        .send({ cmd: 'validate_refresh_token' }, { refreshToken, userId })
        .pipe(timeout(5000)),
    );
  }

  // ---------------------------
  // New access token from refresh payload
  // ---------------------------
  createAccessTokenFromRefreshToken(user: PayloadToken) {
    this.logger.log(`Creating new access token for user ID: ${user.userid}`);
    const payload: PayloadToken = { role: user.role, userid: user.userid };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
    };
  }

  // ---------------------------
  // Step 1: Forgot Password → send 6-digit code
  // ---------------------------
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = (dto.email ?? '').trim().toLowerCase();

    const genericResponse: any = {
      success: true,
      message:
        'If an account exists for this email, a reset code has been sent.',
    };

    let user: AnyUser | null = null;
    try {
      user = await firstValueFrom(
        this.userClient
          .send<AnyUser>({ cmd: 'find_user_by_email' }, { email })
          .pipe(timeout(5000)),
      );
    } catch {
      try {
        user = await firstValueFrom(
          this.userClient
            .send<AnyUser>({ cmd: 'get_user_by_email' }, { email })
            .pipe(timeout(5000)),
        );
      } catch {
        /* ignore */
      }
    }

    const uid = user?.id ?? user?.user_id ?? user?.UserId ?? user?.userId;

    if (!uid) {
      this.logger.debug(`[AuthService] forgotPassword: no user for ${email}`);
      if (this.exposeResetLink) {
        genericResponse.debug = {
          note: 'No user found',
        };
      }
      return genericResponse;
    }

    const userId = String(uid);

    // 6-digit numeric code
    const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(rawCode).digest('hex');

    const expiresInMinutes = Number(
      this.config.get('RESET_CODE_EXPIRES_MIN') ??
        this.config.get('RESET_TOKEN_EXPIRES_MIN') ??
        15,
    );
    const expiresAt = new Date(
      Date.now() + expiresInMinutes * 60 * 1000,
    ).toISOString();

    // Store hashed code in user-service
    const stored = await firstValueFrom(
      this.userClient
        .send<boolean>(
          { cmd: 'create_reset_code' },
          { userId, email, codeHash, expiresAt },
        )
        .pipe(timeout(5000)),
    ).catch((err) => {
      this.logger.error('[AuthService] create_reset_code failed', err);
      return false;
    });

    if (!stored) {
      if (this.exposeResetLink) {
        genericResponse.debug = {
          note: 'Code not stored',
          code: rawCode,
        };
      }
      return genericResponse;
    }

    if (this.mailer) {
      try {
        this.logger.log(
          `[AuthService] Sending reset code email to ${email} via SMTP_HOST=${this.config.get(
            'SMTP_HOST',
          )}`,
        );

        const from =
          this.config.get<string>('SMTP_FROM') ?? 'no-reply@salamnest.local';
        await this.mailer.sendMail({
          from,
          to: email,
          subject: 'Your SalamNest password reset code',
          html: `
            <p>Hello,</p>
            <p>You requested to reset your password. Use the code below to continue:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${rawCode}</p>
            <p>This code will expire in ${expiresInMinutes} minutes.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
          `,
          text: `Your SalamNest reset code is: ${rawCode}\nThis code will expire in ${expiresInMinutes} minutes.`,
        });

        this.logger.log(
          `[AuthService] Reset code email sent successfully to ${email}`,
        );
      } catch (e) {
        this.logger.error(
          '[AuthService] Forgot password email send failed',
          e,
        );
        if (this.exposeResetLink) {
          genericResponse.debug = {
            note: 'Email send failed',
            code: rawCode,
          };
        }
      }
    } else {
      this.logger.warn('[AuthService] Mailer not configured; email NOT sent.');
      if (this.exposeResetLink) {
        genericResponse.debug = { note: 'Mailer disabled', code: rawCode };
      }
    }

    return genericResponse;
  }

  // ---------------------------
  // Step 2: Verify code → return resetToken
  // ---------------------------
  async verifyResetCode(dto: VerifyResetCodeDto) {
    const email = (dto.email ?? '').trim().toLowerCase();
    const code = (dto.code ?? '').trim();

    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    const raw:
      | { success: boolean; userId?: string; reason?: string }
      | null = await firstValueFrom(
      this.userClient
        .send<{ success: boolean; userId?: string; reason?: string }>(
          { cmd: 'verify_reset_code' },
          { email, codeHash },
        )
        .pipe(timeout(7000)),
    ).catch((err) => {
      this.logger.error('[AuthService] verify_reset_code failed', err);
      return { success: false, reason: 'internal_error' };
    });

    if (!raw || raw.success !== true || !raw.userId) {
      throw new BadRequestException(raw?.reason ?? 'Invalid or expired code');
    }

    const userId = String(raw.userId);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresInMinutes = Number(
      this.config.get('RESET_TOKEN_EXPIRES_MIN') ?? 60,
    );
    const expiresAt = new Date(
      Date.now() + expiresInMinutes * 60 * 1000,
    ).toISOString();

    const stored = await firstValueFrom(
      this.userClient
        .send<boolean>(
          { cmd: 'create_password_reset' },
          { userId, email, tokenHash, expiresAt },
        )
        .pipe(timeout(5000)),
    ).catch((err) => {
      this.logger.error(
        '[AuthService] verifyResetCode: create_password_reset failed',
        err,
      );
      return false;
    });

    if (!stored) {
      throw new InternalServerErrorException(
        'Could not prepare password reset token.',
      );
    }

    return {
      success: true,
      message: 'Code verified. You can now reset your password.',
      resetToken: rawToken,
    };
  }

  // ---------------------------
  // Step 3: Reset Password (unchanged, uses resetToken)
  // ---------------------------
  async resetPassword(dto: ResetPasswordDto) {
    const { token, newPassword } = dto;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const raw:
      | { success: boolean; userId?: string; reason?: string }
      | null = await firstValueFrom(
      this.userClient
        .send<{ success: boolean; userId?: string; reason?: string }>(
          { cmd: 'reset_password_with_token' },
          { tokenHash, newPassword },
        )
        .pipe(timeout(7000)),
    ).catch((err) => {
      this.logger.error('[AuthService] reset_password_with_token failed', err);
      return { success: false, reason: 'internal_error' };
    });

    if (!raw || raw.success !== true || !raw.userId) {
      throw new BadRequestException(raw?.reason ?? 'Invalid or expired token');
    }

    await firstValueFrom(
      this.userClient
        .send<boolean>({ cmd: 'remove_refresh_token' }, { userId: raw.userId })
        .pipe(timeout(5000)),
    ).catch(() => false);

    return { success: true, message: 'Password has been reset successfully.' };
  }
}
