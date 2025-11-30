import { DomainException } from '../domain.exception';

/**
 * PositionValidationException
 *
 * Exception thrown when position validation fails due to business rule violations.
 */
export class PositionValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'POSITION_VALIDATION_FAILED');
  }
}
