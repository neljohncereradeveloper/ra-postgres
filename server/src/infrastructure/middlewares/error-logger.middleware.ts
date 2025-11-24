import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('ErrorLogger');

  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        this.logger.error(
          `Error occurred: Method: ${req.method}, URL: ${req.originalUrl}, Status: ${res.statusCode}`,
        );
      }
    });
    next();
  }
}
