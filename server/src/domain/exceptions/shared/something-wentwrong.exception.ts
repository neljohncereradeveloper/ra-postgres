// domain/exceptions/event-update.exception.ts

import { DomainException } from '../domain.exception';

export class SomethinWentWrongException extends DomainException {
  constructor(
    message: string = 'Event updates are not allowed due to the event state.',
  ) {
    super(message, 'SOMETHING_WENTWRONG', 500);
  }
}
