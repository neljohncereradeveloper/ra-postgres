import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

@Injectable()
export class LoginRateLimitingGuard implements CanActivate {
  private rateLimiter: any;

  constructor() {
    this.rateLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 5, // limit each IP to 5 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      handler: () => {
        throw new BadRequestException(
          'Too many request. Please try again after 1 minute',
        );
      },
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    return new Promise((resolve, reject) => {
      this.rateLimiter(request, response, (nextResult) => {
        if (nextResult instanceof Error) {
          reject(nextResult);
        } else {
          resolve(true);
        }
      });
    });
  }
}
