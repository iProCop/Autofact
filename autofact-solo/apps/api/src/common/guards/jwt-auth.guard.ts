import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Требуется авторизация');
    }
    return user;
  }
}

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActive(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      return true;
    }
    return true;
  }

  handleRequest<TUser>(_err: Error | null, user: TUser): TUser | null {
    return user ?? null;
    
  }
}