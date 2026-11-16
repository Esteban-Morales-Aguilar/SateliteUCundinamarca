import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/** Valida el JWT de auth-service (secreto compartido) y exige rol admin. */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = (req.headers.authorization as string | undefined)?.replace(/^Bearer /, '');
    if (!token) throw new UnauthorizedException();
    let payload: { role?: string };
    try { payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_SECRET }); }
    catch { throw new UnauthorizedException(); }
    if (payload.role !== 'admin') throw new ForbiddenException('Se requiere rol admin');
    req.user = payload;
    return true;
  }
}
