// domain/policies/position/position-validation.policy.ts

import { Position } from '@domain/models/position.model';
import { PositionBusinessException } from '@domains/exceptions/position/position-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * PositionValidationPolicy
 *
 * This policy enforces business rules for position validation.
 */
export class PositionValidationPolicy {
  /**
   * Validates position data
   *
   * This method enforces domain validation rules such as:
   * - Position must not be null
   * - Election ID must be provided and greater than zero
   * - Position name (desc1) must be provided and meet length requirements (3-255 characters)
   * - Position name cannot be empty or just whitespace
   * - Max candidates must be provided and greater than zero
   * - Term limit must be provided and not empty
   *
   * @param position - The position to validate
   * @throws PositionValidationException - If position validation fails
   */
  validate(position: Position): void {
    if (!position) {
      throw new PositionBusinessException(
        'Position not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if electionId is provided (foreign key reference to Election primary key)
    if (!position.electionid || position.electionid <= 0) {
      throw new PositionBusinessException(
        'Election ID is required and must be a valid positive integer.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 is provided
    if (!position.desc1 || position.desc1.trim().length === 0) {
      throw new PositionBusinessException(
        'Position name is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 length is within limits (255 characters max based on entity)
    if (position.desc1.length > 255) {
      throw new PositionBusinessException(
        'Position name must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 has minimum length
    if (position.desc1.trim().length < 3) {
      throw new PositionBusinessException(
        'Position name must be at least 3 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if maxCandidates is provided and greater than zero
    if (!position.maxcandidates || position.maxcandidates <= 0) {
      throw new PositionBusinessException(
        'Max candidates is required and must be a valid positive integer.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if termLimit is provided
    if (!position.termlimit || position.termlimit.trim().length === 0) {
      throw new PositionBusinessException(
        'Term limit is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
