import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, headers, ip, query, body } = req; // Extract data from the request
    const userAgent = headers['user-agent'] || 'Unknown';
    const startTime = Date.now();

    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const { statusCode } = res;

      // Log the request details
      this.logger.log(
        `Method: ${method}, URL: ${originalUrl}, Status: ${statusCode}, Time: ${responseTime}ms, IP: ${ip}, User-Agent: ${userAgent}, Query: ${JSON.stringify(
          query,
        )}, Body: ${JSON.stringify(body)}`,
      );
    });

    next();
  }
}
