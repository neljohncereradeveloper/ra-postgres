// domain/policies/district/district-validation.policy.ts

import { District } from '@domain/models/district.model';
import { DistrictValidationException } from '@domains/exceptions/district/district-validation.exception';

/**
 * DistrictValidationPolicy
 *
 * This policy enforces business rules for district validation.
 */
export class DistrictValidationPolicy {
  /**
   * Validates district data
   *
   * @param district - The district to validate
   * @throws DistrictValidationException - If district validation fails
   */
  validate(district: District): void {
    if (!district) {
      throw new DistrictValidationException('District not found');
    }

    // Validate if electionId is provided
    if (!district.electionId) {
      throw new DistrictValidationException('Election ID is required.');
    }

    // Validate if desc1 is provided
    if (!district.desc1 || district.desc1.trim().length === 0) {
      throw new DistrictValidationException(
        'District name is required and cannot be empty.',
      );
    }

    // Validate if desc1 length is within limits (100 characters max)
    if (district.desc1.length > 100) {
      throw new DistrictValidationException(
        'District name must not exceed 100 characters.',
      );
    }

    // Validate if desc1 has minimum length
    if (district.desc1.trim().length < 3) {
      throw new DistrictValidationException(
        'District name must be at least 3 characters long.',
      );
    }
  }
}
