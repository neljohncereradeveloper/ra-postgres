import { ElectionCancelPolicy } from '@domain/policies/election/election-cancel.policy';
import { ElectionClosePolicy } from '@domain/policies/election/election-close.policy';
import { ElectionStartPolicy } from '@domain/policies/election/election-start.policy';
import { ElectionLockPolicy } from '@domain/policies/election/election-lock.policy';
import { ElectionValidationPolicy } from '@domain/policies/election/election-validation.policy';
import { ElectionStatus } from '@domain/enums/index';
import { ElectionBusinessException } from '../exceptions';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

export class Election {
  id: number;
  name: string;
  desc1: string;
  address: string;
  date: Date;
  maxattendees: number;
  electionstatus: ElectionStatus;
  starttime?: Date;
  endtime?: Date;
  deletedby?: string;
  deletedat?: Date | null;
  createdby?: string;
  createdat?: Date;
  updatedby?: string;
  updatedat?: Date;

  constructor(params: {
    id?: number;
    name?: string;
    desc1?: string;
    address?: string;
    starttime?: Date;
    endtime?: Date;
    maxattendees?: number;
    electionstatus?: ElectionStatus;
    date?: Date;
    deletedby?: string;
    deletedat?: Date | null;
    createdby?: string;
    createdat?: Date;
    updatedby?: string;
    updatedat?: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.desc1 = params.desc1;
    this.address = params.address;
    this.date = params.date;
    this.starttime = params.starttime;
    this.endtime = params.endtime;
    this.maxattendees = params.maxattendees;
    this.electionstatus = params.electionstatus;
    this.deletedby = params.deletedby;
    this.createdby = params.createdby;
    this.createdat = params.createdat;
    this.updatedby = params.updatedby;
    this.updatedat = params.updatedat;
    this.deletedat = params.deletedat;
  }

  /**
   * Creates a new election instance with validation
   *
   * This static factory method creates a new election and validates it
   * to ensure it meets all business rules before being persisted.
   *
   * Why static? Because we're creating a NEW instance - there's no existing
   * instance to call the method on. Static methods can be called on the class
   * itself: Election.create({...})
   *
   * @param params - Election creation parameters
   * @returns A new validated Election instance
   * @throws ElectionValidationException - If validation fails
   */
  static create(params: {
    name: string;
    desc1: string;
    address: string;
    date: Date;
    maxattendees?: number;
    createdby?: string;
  }): Election {
    const election = new Election({
      name: params.name,
      desc1: params.desc1,
      address: params.address,
      date: params.date,
      maxattendees: params.maxattendees,
      electionstatus: ElectionStatus.SCHEDULED,
      createdby: params.createdby,
      createdat: getPHDateTime(),
    });
    // Validate the election before returning
    election.validate();
    return election;
  }

  /**
   * Start the election
   * @param delegatesCount - The number of delegates in the election
   * @param districtCount - The number of districts in the election
   * @param positionCount - The number of positions in the election
   * @param candidateCount - The number of candidates in the election
   */

  startEvent(
    delegatescount: number,
    districtcount: number,
    positioncount: number,
    candidatecount: number,
  ): void {
    // Validate if the election can be started
    new ElectionStartPolicy().validateElectionStart(
      this,
      delegatescount,
      districtcount,
      positioncount,
      candidatecount,
    );
    // set election data
    this.starttime = getPHDateTime();
    this.electionstatus = ElectionStatus.STARTED;
  }

  /**
   * Close the election
   */
  closeEvent(): void {
    // Validate if the election can be closed
    new ElectionClosePolicy().validateElectionClose(this);
    // set election data
    this.endtime = getPHDateTime();
    this.electionstatus = ElectionStatus.CLOSED;
  }

  /**
   * Cancel the election
   */

  cancelEvent(description: string): void {
    // Validate if the election can be cancelled
    new ElectionCancelPolicy().validateElectionCancel(this);
    // set election data
    this.desc1 = description;
    this.starttime = null;
    this.endtime = null;
    this.electionstatus = ElectionStatus.CANCELLED;
  }

  /**
   * Updates the election details
   *
   * This method encapsulates the logic for updating election properties.
   * It validates the new state before applying changes to ensure the election
   * remains in a valid state. If validation fails, no changes are applied.
   *
   * @param dto - Election data containing fields to update (all fields are required)
   * @param updatedBy - Username of the user performing the update (required for audit)
   * @throws ElectionValidationException - If validation fails
   */
  update(dto: {
    name: string;
    desc1: string;
    address: string;
    date: Date;
    maxattendees: number;
    starttime: Date | null;
    endtime: Date | null;
    updatedby: string;
  }): void {
    if (this.deletedat) {
      throw new ElectionBusinessException(
        'Election is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary election with the new values to validate before applying
    const tempElection = new Election({
      id: this.id,
      name: dto.name,
      desc1: dto.desc1,
      address: dto.address,
      date: dto.date,
      maxattendees: dto.maxattendees,
      starttime: dto.starttime,
      endtime: dto.endtime,
      electionstatus: this.electionstatus,
    });
    // Validate the new state before applying changes
    tempElection.validate();

    // Apply changes only if validation passes (data is already validated)
    this.name = dto.name;
    this.desc1 = dto.desc1;
    this.address = dto.address;
    this.date = dto.date;
    this.maxattendees = dto.maxattendees;
    this.starttime = dto.starttime;
    this.endtime = dto.endtime;
    this.updatedby = dto.updatedby;
    this.updatedat = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the election
   */
  archive(deletedby: string): void {
    // Validate if the election is not already archived
    if (this.deletedat) {
      throw new ElectionBusinessException(
        'Election is already archived.',
        HTTP_STATUS.CONFLICT,
      );
    }

    // archive the election
    this.deletedat = getPHDateTime();
    this.deletedby = deletedby;
  }

  /**
   * Restores a previously archived election
   */
  restore(): void {
    if (!this.deletedat) {
      throw new ElectionBusinessException(
        `Election with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the election
    this.deletedat = null;
    this.deletedby = null;
  }

  /**
   * Validates the election against business rules
   *
   * This method enforces domain validation rules such as:
   * - Name must meet length requirements
   * - Address must be provided
   * - Date must be valid
   * - Max attendees must be positive if provided
   *
   * @throws ElectionValidationException - If validation fails
   */
  validate(): void {
    new ElectionValidationPolicy().validate(this);
  }

  /**
   * Validates if the election can be updated
   *
   * This method checks if the election is in a state that allows updates
   * (not closed, cancelled, or started).
   *
   * @throws ElectionMutationLockedException - If update is not allowed
   */
  validateForUpdate(): void {
    new ElectionLockPolicy().validate(this);
  }
}
