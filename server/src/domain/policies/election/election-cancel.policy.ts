// domain/policies/event-cancellation.policy.ts

import { ElectionStatus } from '@domain/enums/index';
import { Election } from '@domain/models/election.model';
import { ElectionBusinessException } from '@domains/exceptions/election/election-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * ElectionCancelPolicy
 *
 * This policy enforces business rules for canceling an election.
 *
 * @param election - The election to validate
 * @throws ElectionBusinessException - If the election business rule validation fails
 */
export class ElectionCancelPolicy {
  validateElectionCancel(election: Election): void {
    // Validate if the election is not cancelled
    if (election.election_status === ElectionStatus.CANCELLED) {
      throw new ElectionBusinessException(
        'Election is already cancelled.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    // Validate if the election is not closed
    if (election.election_status === ElectionStatus.CLOSED) {
      throw new ElectionBusinessException(
        'Election has already closed. Cannot be cancelled.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
