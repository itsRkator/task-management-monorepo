/* c8 ignore start - import statements are covered by multiple test imports */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
/* c8 ignore end */

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method?: string;
      url?: string;
    }>();
    const method = request.method ?? 'UNKNOWN';
    const url = request.url ?? 'UNKNOWN';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<{
            statusCode?: number;
          }>();
          const delay = Date.now() - now;
          const statusCode = response.statusCode ?? 200;
          this.logger.log(`${method} ${url} ${statusCode} - ${delay}ms`);
        },
        error: (error: Error & { message?: string }) => {
          const delay = Date.now() - now;
          const errorMessage = error?.message ?? 'Unknown error';
          this.logger.error(
            `${method} ${url} - ${delay}ms - Error: ${errorMessage}`,
          );
        },
      }),
    );
  }
}
