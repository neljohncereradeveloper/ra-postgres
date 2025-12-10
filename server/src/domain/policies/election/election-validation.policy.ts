import { Election } from '@domain/models/election.model';
import { ElectionStatus } from '@domain/enums/index';
import { ElectionBusinessException } from '@domains/exceptions/election/election-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

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
   * @throws ElectionBusinessException - If election business rule validation fails
   */
  validate(election: Election): void {
    if (!election) {
      throw new ElectionBusinessException(
        'Election not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if name is provided
    if (!election.name || election.name.trim().length === 0) {
      throw new ElectionBusinessException(
        'Election name is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if name length is within limits (255 characters max based on entity)
    if (election.name.length > 255) {
      throw new ElectionBusinessException(
        'Election name must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if name has minimum length
    if (election.name.trim().length < 2) {
      throw new ElectionBusinessException(
        'Election name must be at least 2 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 length is within limits (if provided)
    if (election.desc1 !== undefined && election.desc1 !== null) {
      if (election.desc1.length > 65535) {
        // TEXT type can hold up to 65,535 characters
        throw new ElectionBusinessException(
          'Election description must not exceed 65535 characters.',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }

    // Validate if address is provided
    if (!election.address || election.address.trim().length === 0) {
      throw new ElectionBusinessException(
        'Election address is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if address length is within reasonable limits (65535 characters max for TEXT type)
    if (election.address.length > 65535) {
      throw new ElectionBusinessException(
        'Election address must not exceed 65535 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if date is provided
    if (!election.date) {
      throw new ElectionBusinessException(
        'Election date is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if date is a valid date
    if (!(election.date instanceof Date) || isNaN(election.date.getTime())) {
      throw new ElectionBusinessException(
        'Election date must be a valid date.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if startTime is a valid date if provided
    if (
      election.starttime !== undefined &&
      election.starttime !== null &&
      (!(election.starttime instanceof Date) ||
        isNaN(election.starttime.getTime()))
    ) {
      throw new ElectionBusinessException(
        'Start time must be a valid date.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if endTime is a valid date if provided
    if (
      election.endtime !== undefined &&
      election.endtime !== null &&
      (!(election.endtime instanceof Date) || isNaN(election.endtime.getTime()))
    ) {
      throw new ElectionBusinessException(
        'End time must be a valid date.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if endTime is after startTime when both are provided
    if (
      election.starttime &&
      election.endtime &&
      election.endtime < election.starttime
    ) {
      throw new ElectionBusinessException(
        'End time must be after start time.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if electionStatus is provided
    if (!election.electionstatus) {
      throw new ElectionBusinessException(
        'Election status is required.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if electionStatus is a valid enum value
    const validStatuses = Object.values(ElectionStatus);
    if (!validStatuses.includes(election.electionstatus)) {
      throw new ElectionBusinessException(
        `Election status must be one of: ${validStatuses.join(', ')}.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if maxAttendees is positive if provided
    if (election.maxattendees !== undefined && election.maxattendees !== null) {
      if (election.maxattendees <= 0) {
        throw new ElectionBusinessException(
          'Maximum attendees must be greater than zero.',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }
  }
}
