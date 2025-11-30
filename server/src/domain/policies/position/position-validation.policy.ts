// domain/policies/position/position-validation.policy.ts

import { Position } from '@domain/models/position.model';
import { PositionValidationException } from '@domains/exceptions/position/position-validation.exception';

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
      throw new PositionValidationException('Position not found');
    }

    // Validate if electionId is provided (foreign key reference to Election primary key)
    if (!position.electionId || position.electionId <= 0) {
      throw new PositionValidationException(
        'Election ID is required and must be a valid positive integer.',
      );
    }

    // Validate if desc1 is provided
    if (!position.desc1 || position.desc1.trim().length === 0) {
      throw new PositionValidationException(
        'Position name is required and cannot be empty.',
      );
    }

    // Validate if desc1 length is within limits (255 characters max based on entity)
    if (position.desc1.length > 255) {
      throw new PositionValidationException(
        'Position name must not exceed 255 characters.',
      );
    }

    // Validate if desc1 has minimum length
    if (position.desc1.trim().length < 3) {
      throw new PositionValidationException(
        'Position name must be at least 3 characters long.',
      );
    }

    // Validate if maxCandidates is provided and greater than zero
    if (!position.maxCandidates || position.maxCandidates <= 0) {
      throw new PositionValidationException(
        'Max candidates is required and must be a valid positive integer.',
      );
    }

    // Validate if termLimit is provided
    if (!position.termLimit || position.termLimit.trim().length === 0) {
      throw new PositionValidationException(
        'Term limit is required and cannot be empty.',
      );
    }
  }
}
