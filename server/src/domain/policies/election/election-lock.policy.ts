import { ElectionStatus } from '@domain/enums/index';
import { Election } from '@domain/models/election.model';
import { ElectionBusinessException } from '@domains/exceptions/election/election-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * ElectionLockPolicy
 *
 * This policy enforces data lock rules when an election is closed or cancelled.
 *
 * @param election - The election to validate
 * @throws ElectionBusinessException - If the election business rule validation fails
 */
export class ElectionLockPolicy {
  validate(election: Election): void {
    // Validate if the election is not closed
    if (election.election_status === ElectionStatus.CLOSED) {
      throw new ElectionBusinessException(
        'Cannot update election. Election has already closed.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the election is not cancelled
    if (election.election_status === ElectionStatus.CANCELLED) {
      throw new ElectionBusinessException(
        'Cannot update election. Election is already cancelled.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the election is not started
    if (election.election_status === ElectionStatus.STARTED) {
      throw new ElectionBusinessException(
        'Cannot update election. Election has already started.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
