/* c8 ignore start - import statements are covered by multiple test imports */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
/* c8 ignore end */

@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  private readonly timeout: number;

  constructor() {
    // Default 30 seconds, configurable via environment variable
    this.timeout = parseInt(process.env.REQUEST_TIMEOUT || '30000', 10);
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Set timeout for the request
    req.setTimeout(this.timeout, () => {
      if (!res.headersSent) {
        res.status(408).json({
          statusCode: 408,
          message: 'Request timeout',
          timestamp: new Date().toISOString(),
        });
      }
    });

    next();
  }
}
