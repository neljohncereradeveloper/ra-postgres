// domain/policies/precinct/precinct-validation.policy.ts

import { Precinct } from '@domain/models/precinct.model';
import { PrecinctValidationException } from '@domains/exceptions/precinct/precinct-validation.exception';

/**
 * PrecinctValidationPolicy
 *
 * This policy enforces business rules for precinct validation.
 */
export class PrecinctValidationPolicy {
  /**
   * Validates precinct data
   *
   * This method enforces domain validation rules such as:
   * - Precinct must not be null
   * - Precinct name (desc1) must be provided and meet length requirements (3-255 characters)
   * - Precinct name cannot be empty or just whitespace
   *
   * @param precinct - The precinct to validate
   * @throws PrecinctValidationException - If precinct validation fails
   */
  validate(precinct: Precinct): void {
    if (!precinct) {
      throw new PrecinctValidationException('Precinct not found');
    }

    // Validate if desc1 is provided
    if (!precinct.desc1 || precinct.desc1.trim().length === 0) {
      throw new PrecinctValidationException(
        'Precinct name is required and cannot be empty.',
      );
    }

    // Validate if desc1 length is within limits (255 characters max based on entity)
    if (precinct.desc1.length > 255) {
      throw new PrecinctValidationException(
        'Precinct name must not exceed 255 characters.',
      );
    }

    // Validate if desc1 has minimum length
    if (precinct.desc1.trim().length < 3) {
      throw new PrecinctValidationException(
        'Precinct name must be at least 3 characters long.',
      );
    }
  }
}
