import { ElectionStatus } from '@domain/enums/index';
import { Election } from '@domain/models/election.model';
import { ElectionBusinessException } from '@domains/exceptions/election/election-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';
import { getPHDateString } from '@domain/utils/format-ph-time';

/**
 * ElectionStartPolicy
 *
 * This policy enforces business rules for starting an election.
 *
 * @param election - The election to validate
 * @param delegatesCount - The number of delegates in the election
 * @param districtCount - The number of districts in the election
 * @param positionCount - The number of positions in the election
 * @param candidateCount - The number of candidates in the election
 * @throws ElectionBusinessException - If the election business rule validation fails
 */
export class ElectionStartPolicy {
  validateElectionStart(
    election: Election,
    delegates_count: number,
    district_count: number,
    position_count: number,
    candidate_count: number,
  ): void {
    const current_date = getPHDateString();
    const election_date = getPHDateString(election.date);

    // Validate if the delegates are uploaded
    if (delegates_count === 0) {
      throw new ElectionBusinessException(
        'No delegates. Please upload delegates first',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the districts are created
    if (district_count === 0) {
      throw new ElectionBusinessException(
        'No districts. Please create districts first',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the positions are created
    if (position_count === 0) {
      throw new ElectionBusinessException(
        'No positions. Please create positions first',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the candidates are created
    if (candidate_count === 0) {
      throw new ElectionBusinessException(
        'No candidates. Please create candidates first',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the election is not started
    if (election.election_status === ElectionStatus.STARTED) {
      throw new ElectionBusinessException(
        'Election has already started.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the election is not cancelled
    if (election.election_status === ElectionStatus.CANCELLED) {
      throw new ElectionBusinessException(
        `Election cancelled.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the election is not closed
    if (election.election_status === ElectionStatus.CLOSED) {
      throw new ElectionBusinessException(
        `Election already closed.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the election is scheduled for today
    if (election_date !== current_date) {
      throw new ElectionBusinessException(
        'Election is not scheduled for today.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
