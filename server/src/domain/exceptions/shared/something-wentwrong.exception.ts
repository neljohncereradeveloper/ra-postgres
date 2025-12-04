// domain/exceptions/event-update.exception.ts

import { DomainException } from '../domain.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

export class SomethinWentWrongException extends DomainException {
  constructor(message: string = 'Something went wrong.') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'SOMETHING_WENTWRONG');
  }
}
