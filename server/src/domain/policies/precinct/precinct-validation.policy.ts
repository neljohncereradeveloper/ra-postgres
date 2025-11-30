// domain/policies/precinct/precinct-validation.policy.ts

import { Precinct } from '@domain/models/precinct.model';
import { PrecinctBusinessValidationException } from '@domains/exceptions/precinct/precinct-business-validation.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

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
   * @throws PrecinctBusinessValidationException - If precinct validation fails
   */
  validate(precinct: Precinct): void {
    if (!precinct) {
      throw new PrecinctBusinessValidationException(
        'Precinct not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if desc1 is provided
    if (!precinct.desc1 || precinct.desc1.trim().length === 0) {
      throw new PrecinctBusinessValidationException(
        'Precinct name is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 length is within limits (255 characters max based on entity)
    if (precinct.desc1.length > 255) {
      throw new PrecinctBusinessValidationException(
        'Precinct name must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 has minimum length
    if (precinct.desc1.trim().length < 3) {
      throw new PrecinctBusinessValidationException(
        'Precinct name must be at least 3 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
