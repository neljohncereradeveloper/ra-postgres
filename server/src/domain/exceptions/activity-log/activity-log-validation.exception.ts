import { DomainException } from '../domain.exception';

/**
 * ActivityLogValidationException
 *
 * Exception thrown when activity log validation fails due to business rule violations.
 */
export class ActivityLogValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'ACTIVITY_LOG_VALIDATION_FAILED');
  }
}

