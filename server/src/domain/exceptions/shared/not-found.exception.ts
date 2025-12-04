// domain/exceptions/event-update.exception.ts

import { DomainException } from '../domain.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

export class NotFoundException extends DomainException {
  constructor(message: string = 'Resource not found.') {
    super(message, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND_EXCEPTION');
  }
}
