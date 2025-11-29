import { Election } from '@domain/models/election.model';
import { ElectionStatus } from '@domain/enums/index';
import { ElectionValidationException } from '@domains/exceptions/election/election-validation.exception';

/**
 * ElectionValidationPolicy
 *
 * This policy enforces business rules for election validation.
 */
export class ElectionValidationPolicy {
  /**
   * Validates election data
   *
   * This method enforces domain validation rules such as:
   * - Election must not be null
   * - Name must be provided and meet length requirements (2-255 characters)
   * - Description (desc1) must meet length requirements if provided
   * - Address must be provided and meet length requirements
   * - Date must be provided and valid
   * - Election status must be a valid enum value
   * - Max attendees must be positive if provided
   * - Start time and end time must be valid dates if provided
   * - End time must be after start time if both are provided
   *
   * @param election - The election to validate
   * @throws ElectionValidationException - If election validation fails
   */
  validate(election: Election): void {
    if (!election) {
      throw new ElectionValidationException('Election not found');
    }

    // Validate if name is provided
    if (!election.name || election.name.trim().length === 0) {
      throw new ElectionValidationException(
        'Election name is required and cannot be empty.',
      );
    }

    // Validate if name length is within limits (255 characters max based on entity)
    if (election.name.length > 255) {
      throw new ElectionValidationException(
        'Election name must not exceed 255 characters.',
      );
    }

    // Validate if name has minimum length
    if (election.name.trim().length < 2) {
      throw new ElectionValidationException(
        'Election name must be at least 2 characters long.',
      );
    }

    // Validate if desc1 length is within limits (if provided)
    if (election.desc1 !== undefined && election.desc1 !== null) {
      if (election.desc1.length > 65535) {
        // TEXT type can hold up to 65,535 characters
        throw new ElectionValidationException(
          'Election description must not exceed 65535 characters.',
        );
      }
    }

    // Validate if address is provided
    if (!election.address || election.address.trim().length === 0) {
      throw new ElectionValidationException(
        'Election address is required and cannot be empty.',
      );
    }

    // Validate if address length is within reasonable limits (65535 characters max for TEXT type)
    if (election.address.length > 65535) {
      throw new ElectionValidationException(
        'Election address must not exceed 65535 characters.',
      );
    }

    // Validate if date is provided
    if (!election.date) {
      throw new ElectionValidationException(
        'Election date is required and cannot be empty.',
      );
    }

    // Validate if date is a valid date
    if (!(election.date instanceof Date) || isNaN(election.date.getTime())) {
      throw new ElectionValidationException(
        'Election date must be a valid date.',
      );
    }

    // Validate if startTime is a valid date if provided
    if (
      election.startTime !== undefined &&
      election.startTime !== null &&
      (!(election.startTime instanceof Date) ||
        isNaN(election.startTime.getTime()))
    ) {
      throw new ElectionValidationException('Start time must be a valid date.');
    }

    // Validate if endTime is a valid date if provided
    if (
      election.endTime !== undefined &&
      election.endTime !== null &&
      (!(election.endTime instanceof Date) || isNaN(election.endTime.getTime()))
    ) {
      throw new ElectionValidationException('End time must be a valid date.');
    }

    // Validate if endTime is after startTime when both are provided
    if (
      election.startTime &&
      election.endTime &&
      election.endTime < election.startTime
    ) {
      throw new ElectionValidationException(
        'End time must be after start time.',
      );
    }

    // Validate if electionStatus is provided
    if (!election.electionStatus) {
      throw new ElectionValidationException('Election status is required.');
    }

    // Validate if electionStatus is a valid enum value
    const validStatuses = Object.values(ElectionStatus);
    if (!validStatuses.includes(election.electionStatus)) {
      throw new ElectionValidationException(
        `Election status must be one of: ${validStatuses.join(', ')}.`,
      );
    }

    // Validate if maxAttendees is positive if provided
    if (election.maxAttendees !== undefined && election.maxAttendees !== null) {
      if (election.maxAttendees <= 0) {
        throw new ElectionValidationException(
          'Maximum attendees must be greater than zero.',
        );
      }
    }
  }
}
