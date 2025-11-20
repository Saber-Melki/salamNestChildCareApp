// apps/api-gateway/src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type JwtUserPayload = {
  userid: string;
  role: string;
};

export const CurrentUser = createParamDecorator<unknown, JwtUserPayload>(
  (_data: unknown, ctx: ExecutionContext): JwtUserPayload => {
    // JwtAuthGuard (Passport 'jwt' strategy) attaches the decoded payload as request.user
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtUserPayload;
  },
);
