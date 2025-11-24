// domain/exceptions/event-update.exception.ts

import { DomainException } from '../domain.exception';

/**
 * EventUpdateNotAllowedException
 *
 * This exception is thrown when an update is attempted on an event that is not allowed to be updated.
 */
export class EventActivationNotAllowedException extends DomainException {
  constructor(message: string) {
    super(message, 'EVENT_ACTIVATION_FAILED');
  }
}
