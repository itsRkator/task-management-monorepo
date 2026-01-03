/* c8 ignore start - import statements are covered by multiple test imports */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
/* c8 ignore end */

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log error with context
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
      'ExceptionFilter',
    );

    // Don't expose internal error details in production
    const errorResponse =
      status === (HttpStatus.INTERNAL_SERVER_ERROR as number) &&
      process.env.NODE_ENV === 'production'
        ? {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: 'Internal server error',
          }
        : {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message:
              typeof message === 'string'
                ? message
                : (message as { message: string }).message ||
                  'An error occurred',
          };

    response.status(status).json(errorResponse);
  }
}
