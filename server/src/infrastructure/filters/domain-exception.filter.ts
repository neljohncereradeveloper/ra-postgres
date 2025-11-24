// infrastructure/filters/domain-exception.filter.ts
import { DomainException } from '@domains/exceptions/domain.exception';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Map DomainException to an HTTP-specific error
    response.status(400).json({
      message: exception.message,
      error: exception.code || 'DOMAIN_ERROR',
      statusCode: 400,
    });
  }
}
