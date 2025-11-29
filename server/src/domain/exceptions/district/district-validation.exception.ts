// domain/exceptions/district/district-validation.exception.ts

import { DomainException } from '../domain.exception';

/**
 * DistrictValidationException
 *
 * Exception thrown when district validation fails due to business rule violations.
 */
export class DistrictValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'DISTRICT_VALIDATION_FAILED');
  }
}
