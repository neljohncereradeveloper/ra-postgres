// domain/policies/district/district-validation.policy.ts

import { District } from '@domain/models/district.model';
import { DistrictBusinessException } from '@domains/exceptions/district/district-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * DistrictValidationPolicy
 *
 * This policy enforces business rules for district validation.
 */
export class DistrictValidationPolicy {
  /**
   * Validates district data
   *
   * This method enforces domain validation rules such as:
   * - District must not be null
   * - Election ID must be provided and greater than zero
   * - District name must be provided and meet length requirements (3-255 characters)
   * - District name cannot be empty or just whitespace
   *
   * @param district - The district to validate
   * @throws DistrictValidationException - If district validation fails
   */
  validate(district: District): void {
    if (!district) {
      throw new DistrictBusinessException(
        'District not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if electionId is provided (foreign key reference to Election primary key)
    if (!district.election_id || district.election_id <= 0) {
      throw new DistrictBusinessException(
        'Election ID is required and must be a valid positive integer.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 is provided
    if (!district.desc1 || district.desc1.trim().length === 0) {
      throw new DistrictBusinessException(
        'District name is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 length is within limits (255 characters max based on entity)
    if (district.desc1.length > 255) {
      throw new DistrictBusinessException(
        'District name must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 has minimum length
    if (district.desc1.trim().length < 3) {
      throw new DistrictBusinessException(
        'District name must be at least 3 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
