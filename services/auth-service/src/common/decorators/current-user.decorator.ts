import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export interface JwtUser { id: string; email: string; role: string }
export const CurrentUser = createParamDecorator((_d: unknown, ctx: ExecutionContext): JwtUser => ctx.switchToHttp().getRequest().user);
