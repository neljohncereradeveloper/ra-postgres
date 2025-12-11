import { ElectionCancelPolicy } from '@domain/policies/election/election-cancel.policy';
import { ElectionClosePolicy } from '@domain/policies/election/election-close.policy';
import { ElectionStartPolicy } from '@domain/policies/election/election-start.policy';
import { ElectionLockPolicy } from '@domain/policies/election/election-lock.policy';
import { ElectionValidationPolicy } from '@domain/policies/election/election-validation.policy';
import { ElectionStatus } from '@domain/enums/index';
import { ElectionBusinessException } from '../exceptions';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';
import { getPHDateTime, getPHTimeString } from '@domain/utils/format-ph-time';

export class Election {
  id: number;
  name: string;
  desc1: string;
  address: string;
  date: Date;
  max_attendees: number;
  election_status: ElectionStatus;
  start_time?: string;
  end_time?: string;
  deleted_by?: string;
  deleted_at?: Date | null;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;

  constructor(params: {
    id?: number;
    name?: string;
    desc1?: string;
    address?: string;
    start_time?: string;
    end_time?: string;
    max_attendees?: number;
    election_status?: ElectionStatus;
    date?: Date;
    deleted_by?: string;
    deleted_at?: Date | null;
    created_by?: string;
    created_at?: Date;
    updated_by?: string;
    updated_at?: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.desc1 = params.desc1;
    this.address = params.address;
    this.date = params.date;
    this.start_time = params.start_time;
    this.end_time = params.end_time;
    this.max_attendees = params.max_attendees;
    this.election_status = params.election_status;
    this.deleted_by = params.deleted_by;
    this.created_by = params.created_by;
    this.created_at = params.created_at;
    this.updated_by = params.updated_by;
    this.updated_at = params.updated_at;
    this.deleted_at = params.deleted_at;
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
    max_attendees?: number;
    created_by?: string;
  }): Election {
    const election = new Election({
      name: params.name,
      desc1: params.desc1,
      address: params.address,
      date: params.date,
      max_attendees: params.max_attendees,
      election_status: ElectionStatus.SCHEDULED,
      created_by: params.created_by,
      created_at: getPHDateTime(),
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
    delegates_count: number,
    district_count: number,
    position_count: number,
    candidate_count: number,
  ): void {
    // Validate if the election can be started
    new ElectionStartPolicy().validateElectionStart(
      this,
      delegates_count,
      district_count,
      position_count,
      candidate_count,
    );
    // set election data
    this.start_time = getPHTimeString();
    this.election_status = ElectionStatus.STARTED;
  }

  /**
   * Close the election
   */
  closeEvent(): void {
    // Validate if the election can be closed
    new ElectionClosePolicy().validateElectionClose(this);
    // set election data
    this.end_time = getPHTimeString();
    this.election_status = ElectionStatus.CLOSED;
  }

  /**
   * Cancel the election
   */

  cancelEvent(description: string): void {
    // Validate if the election can be cancelled
    new ElectionCancelPolicy().validateElectionCancel(this);
    // set election data
    this.desc1 = description;
    this.start_time = null;
    this.end_time = null;
    this.election_status = ElectionStatus.CANCELLED;
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
    max_attendees: number;
    updated_by: string;
  }): void {
    if (this.deleted_at) {
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
      max_attendees: dto.max_attendees,
      election_status: this.election_status,
    });
    // Validate the new state before applying changes
    tempElection.validate();

    // Apply changes only if validation passes (data is already validated)
    this.name = dto.name;
    this.desc1 = dto.desc1;
    this.address = dto.address;
    this.date = dto.date;
    this.max_attendees = dto.max_attendees;
    this.updated_by = dto.updated_by;
    this.updated_at = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the election
   */
  archive(deleted_by: string): void {
    // Validate if the election is not already archived
    if (this.deleted_at) {
      throw new ElectionBusinessException(
        'Election is already archived.',
        HTTP_STATUS.CONFLICT,
      );
    }

    // archive the election
    this.deleted_at = getPHDateTime();
    this.deleted_by = deleted_by;
  }

  /**
   * Restores a previously archived election
   */
  restore(): void {
    if (!this.deleted_at) {
      throw new ElectionBusinessException(
        `Election with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the election
    this.deleted_at = null;
    this.deleted_by = null;
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
