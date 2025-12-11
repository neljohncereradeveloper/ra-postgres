import { ElectionStatus } from '@domain/enums/index';
import { Election } from '@domain/models/election.model';
import { ElectionBusinessException } from '@domains/exceptions/election/election-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * ElectionClosePolicy
 *
 * This policy enforces business rules for closing an election.
 *
 * @param election - The election to validate
 * @throws ElectionBusinessException - If the election business rule validation fails
 */
export class ElectionClosePolicy {
  validateElectionClose(election: Election): void {
    // Validate if the election is not closed
    if (election.election_status === ElectionStatus.CLOSED) {
      throw new ElectionBusinessException(
        'Election has already closed.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    // Validate if the election is started
    if (election.election_status !== ElectionStatus.STARTED) {
      throw new ElectionBusinessException(
        'Cannot close election. Election is not started.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    // Validate if the start time is before the current time
    // Combine election date with start_time to compare with current time
    if (election.start_time && election.date) {
      const [hours, minutes, seconds] = election.start_time.split(':').map(Number);
      const startDateTime = new Date(election.date);
      startDateTime.setHours(hours, minutes, seconds, 0);
      
      if (new Date() < startDateTime) {
        throw new ElectionBusinessException(
          'End time cannot be before the start time.',
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }
  }
}
