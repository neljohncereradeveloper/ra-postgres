import { ElectionCancelPolicy } from '@domain/policies/election/election-cancel.policy';
import { ElectionClosePolicy } from '@domain/policies/election/election-close.policy';
import { ElectionStartPolicy } from '@domain/policies/election/election-start.policy';
import { ElectionLockPolicy } from '@domain/policies/election/election-lock.policy';
import { ElectionStatus } from '@domain/enums/index';

export class Election {
  id: number;
  name: string;
  desc1: string;
  address: string;
  date: Date;
  maxAttendees: number;
  electionStatus: ElectionStatus;
  startTime?: Date;
  endTime?: Date;
  deletedAt?: Date | null;

  constructor(params: {
    id?: number;
    name?: string;
    desc1?: string;
    address?: string;
    startTime?: Date;
    endTime?: Date;
    maxAttendees?: number;
    electionStatus?: ElectionStatus;
    date?: Date;
    deletedAt?: Date | null;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.desc1 = params.desc1;
    this.address = params.address;
    this.date = params.date;
    this.startTime = params.startTime;
    this.endTime = params.endTime;
    this.maxAttendees = params.maxAttendees;
    this.electionStatus = params.electionStatus;
    this.deletedAt = params.deletedAt;
  }

  /**
   * Start the election
   * @param delegatesCount - The number of delegates in the election
   * @param districtCount - The number of districts in the election
   * @param positionCount - The number of positions in the election
   * @param candidateCount - The number of candidates in the election
   */

  startEvent(
    delegatesCount: number,
    districtCount: number,
    positionCount: number,
    candidateCount: number,
  ): void {
    // Validate if the election can be started
    new ElectionStartPolicy().validateElectionStart(
      this,
      delegatesCount,
      districtCount,
      positionCount,
      candidateCount,
    );
    // set election data
    this.startTime = new Date();
    this.electionStatus = ElectionStatus.STARTED;
  }

  /**
   * Close the election
   */
  closeEvent(): void {
    // Validate if the election can be closed
    new ElectionClosePolicy().validateElectionClose(this);
    // set election data
    this.endTime = new Date();
    this.electionStatus = ElectionStatus.CLOSED;
  }

  /**
   * Cancel the election
   */

  cancelEvent(description: string): void {
    // Validate if the election can be cancelled
    new ElectionCancelPolicy().validateElectionCancel(this);
    // set election data
    this.desc1 = description;
    this.startTime = null;
    this.endTime = null;
    this.electionStatus = ElectionStatus.CANCELLED;
  }

  /**
   * Update the election details
   */
  updateDetails(dto: Partial<Election>): void {
    this.name = dto.name;
    this.desc1 = dto.desc1;
    this.address = dto.address;
    this.maxAttendees = dto.maxAttendees;
    this.date = dto.date;
  }

  /**
   * Validate the election
   */
  validate(): void {
    new ElectionLockPolicy().validate(this);
  }
}
