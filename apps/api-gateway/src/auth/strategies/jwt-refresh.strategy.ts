import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { PayloadToken } from '../models/token.model'; // Define this model
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['refresh_token'];
  }
  return null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_REFRESH_SECRET, // Use environment variables!
      passReqToCallback: true, // We need the request object to get the full token
    });
  }

  async validate(request: Request, payload: PayloadToken) {
    const refreshToken = request.cookies['refresh_token'];
    return firstValueFrom(
      this.authClient.send(
        { cmd: 'validate_refresh_token' },
        {
          refreshToken,
          userId: payload.userid,
        },
      ),
    );
  }
}
