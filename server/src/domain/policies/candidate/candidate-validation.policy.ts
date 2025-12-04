// domain/policies/candidate/candidate-validation.policy.ts

import { Candidate } from '@domain/models/candidate.model';
import { CandidateBusinessException } from '@domains/exceptions/candidate/candidate-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * CandidateValidationPolicy
 *
 * This policy enforces business rules for candidate validation.
 */
export class CandidateValidationPolicy {
  /**
   * Validates candidate data
   *
   * This method enforces domain validation rules such as:
   * - Candidate must not be null
   * - Election ID must be provided and greater than zero
   * - Position ID must be provided and greater than zero
   * - District ID must be provided and greater than zero
   * - Delegate ID must be provided and greater than zero
   * - Display name must be provided and meet length requirements (1-255 characters)
   * - Display name cannot be empty or just whitespace
   *
   * @param candidate - The candidate to validate
   * @throws CandidateBusinessException - If candidate validation fails
   */
  validate(candidate: Candidate): void {
    if (!candidate) {
      throw new CandidateBusinessException(
        'Candidate not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if electionId is provided (foreign key reference to Election primary key)
    if (!candidate.electionId || candidate.electionId <= 0) {
      throw new CandidateBusinessException(
        'Election ID is required and must be a valid positive integer.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if positionId is provided (foreign key reference to Position primary key)
    if (!candidate.positionId || candidate.positionId <= 0) {
      throw new CandidateBusinessException(
        'Position ID is required and must be a valid positive integer.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if districtId is provided (foreign key reference to District primary key)
    if (!candidate.districtId || candidate.districtId <= 0) {
      throw new CandidateBusinessException(
        'District ID is required and must be a valid positive integer.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if delegateId is provided (foreign key reference to Delegate primary key)
    if (!candidate.delegateId || candidate.delegateId <= 0) {
      throw new CandidateBusinessException(
        'Delegate ID is required and must be a valid positive integer.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if displayName is provided
    if (!candidate.displayName || candidate.displayName.trim().length === 0) {
      throw new CandidateBusinessException(
        'Display name is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if displayName length is within limits (255 characters max based on entity)
    if (candidate.displayName.length > 255) {
      throw new CandidateBusinessException(
        'Display name must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
