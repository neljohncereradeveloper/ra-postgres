import { ELECTION_STATUS_CONSTANTS } from '@shared/constants/election.constants';
import { ElectionCancelPolicy } from '@domain/policies/election/election-cancel.policy';
import { ElectionClosePolicy } from '@domain/policies/election/election-end.policy';
import { ElectionStartPolicy } from '@domain/policies/election/election-start.policy';
import { ElectionLockPolicy } from '@domain/policies/election/election-lock.policy';

export class Election {
  id: number;
  name: string;
  desc1: string;
  address: string;
  date: Date;
  maxAttendees: number;
  status: string;
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
    status?: string;
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
    this.status = params.status;
    this.deletedAt = params.deletedAt;
  }

  startEvent(
    delegatesCount: number,
    districtCount: number,
    positionCount: number,
    candidateCount: number,
  ): void {
    new ElectionStartPolicy().validateElectionStart(
      this,
      delegatesCount,
      districtCount,
      positionCount,
      candidateCount,
    );
    this.startTime = new Date();
    this.status = ELECTION_STATUS_CONSTANTS.STARTED;
  }

  closeEvent(delegatesCount: number): void {
    new ElectionClosePolicy().validateElectionClose(this, delegatesCount);
    this.endTime = new Date();
    this.status = ELECTION_STATUS_CONSTANTS.ENDED;
  }

  cancelEvent(): void {
    new ElectionCancelPolicy().validateElectionCancel(this);
    this.startTime = null;
    this.endTime = null;
    this.status = ELECTION_STATUS_CONSTANTS.CANCELLED; // Update the event status to canceled
  }

  updateDetails(dto: Partial<Election>): void {
    this.name = dto.name;
    this.desc1 = dto.desc1;
    this.address = dto.address;
    this.maxAttendees = dto.maxAttendees;
    this.date = dto.date;
  }

  validateMutationAllowed(): void {
    new ElectionLockPolicy().validateMutationAllowed(this);
  }
}
