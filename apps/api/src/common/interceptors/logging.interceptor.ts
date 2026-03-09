import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  // Query param дахь нууц мэдээлэл (token, code) log-д орохоос хамгаалах
  private static readonly SENSITIVE_PARAMS = /[?&](token|code|secret|password|key)=[^&]*/gi;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    // URL-аас нууц query param-уудыг хасаж log бичих
    const sanitizedUrl = url.replace(LoggingInterceptor.SENSITIVE_PARAMS, (match: string) => {
      const paramName = match.split('=')[0];
      return `${paramName}=[REDACTED]`;
    });
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${method} ${sanitizedUrl} ${statusCode} - ${Date.now() - now}ms`);
      }),
    );
  }
}
