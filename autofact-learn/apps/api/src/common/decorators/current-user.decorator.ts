import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class AuthUser {
  userId!: string;
  email!: string;
  role!: 'CLIENT' | 'EXPERT' | 'ADMIN';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
