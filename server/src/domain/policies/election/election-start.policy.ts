import { ElectionStatus } from '@domain/enums/index';
import { Election } from '@domain/models/election.model';
import { ElectionBusinessException } from '@domains/exceptions/election/election-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';
import { getPHDateString } from '@shared/utils/format-ph-time';

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
    delegatesCount: number,
    districtCount: number,
    positionCount: number,
    candidateCount: number,
  ): void {
    const currentDate = getPHDateString();
    const electionDate = getPHDateString(election.date);

    // Validate if the delegates are uploaded
    if (delegatesCount === 0) {
      throw new ElectionBusinessException(
        'No delegates. Please upload delegates first',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the districts are created
    if (districtCount === 0) {
      throw new ElectionBusinessException(
        'No districts. Please create districts first',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the positions are created
    if (positionCount === 0) {
      throw new ElectionBusinessException(
        'No positions. Please create positions first',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the candidates are created
    if (candidateCount === 0) {
      throw new ElectionBusinessException(
        'No candidates. Please create candidates first',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the election is not started
    if (election.electionStatus === ElectionStatus.STARTED) {
      throw new ElectionBusinessException(
        'Election has already started.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the election is not cancelled
    if (election.electionStatus === ElectionStatus.CANCELLED) {
      throw new ElectionBusinessException(
        `Election cancelled.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the election is not closed
    if (election.electionStatus === ElectionStatus.CLOSED) {
      throw new ElectionBusinessException(
        `Election already closed.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if the election is scheduled for today
    if (electionDate !== currentDate) {
      throw new ElectionBusinessException(
        'Election is not scheduled for today.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
