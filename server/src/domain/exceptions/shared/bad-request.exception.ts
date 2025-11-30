// domain/exceptions/event-update.exception.ts

import { DomainException } from '../domain.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

export class BadRequestException extends DomainException {
  constructor(message: string = 'Bad request exception') {
    super(message, HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST_EXCEPTION');
  }
}
