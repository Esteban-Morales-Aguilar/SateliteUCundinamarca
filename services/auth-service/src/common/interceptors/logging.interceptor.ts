import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

/** Log JSON por petición (consumible por Loki). */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest();
    const start = Date.now();
    return next.handle().pipe(tap(() => {
      const res = ctx.switchToHttp().getResponse();
      this.logger.log(JSON.stringify({ service: 'auth-service', method: req.method, path: req.originalUrl, status: res.statusCode, ms: Date.now() - start }));
    }));
  }
}
