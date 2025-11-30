// domain/exceptions/event-update.exception.ts

import { DomainException } from '../domain.exception';

export class BadRequestException extends DomainException {
  constructor(message: string = 'Bad request exception') {
    super(message, 'BAD_REQUEST_EXCEPTION');
  }
}
