import { ElectionCancelPolicy } from '@domain/policies/election/election-cancel.policy';
import { ElectionClosePolicy } from '@domain/policies/election/election-close.policy';
import { ElectionStartPolicy } from '@domain/policies/election/election-start.policy';
import { ElectionLockPolicy } from '@domain/policies/election/election-lock.policy';
import { ElectionValidationPolicy } from '@domain/policies/election/election-validation.policy';
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
  deletedBy?: string;
  deletedAt?: Date | null;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;

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
    deletedBy?: string;
    deletedAt?: Date | null;
    createdBy?: string;
    createdAt?: Date;
    updatedBy?: string;
    updatedAt?: Date;
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
    this.deletedBy = params.deletedBy;
    this.createdBy = params.createdBy;
    this.createdAt = params.createdAt;
    this.updatedBy = params.updatedBy;
    this.updatedAt = params.updatedAt;
    this.deletedAt = params.deletedAt;
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
    maxAttendees?: number;
    createdBy?: string;
  }): Election {
    const election = new Election({
      name: params.name,
      desc1: params.desc1,
      address: params.address,
      date: params.date,
      maxAttendees: params.maxAttendees,
      electionStatus: ElectionStatus.SCHEDULED,
      createdBy: params.createdBy,
      createdAt: new Date(),
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
  update(
    dto: {
      name: string;
      desc1: string;
      address: string;
      date: Date;
      maxAttendees: number;
      startTime: Date | null;
      endTime: Date | null;
    },
    updatedBy: string,
  ): void {
    // Create a temporary election with the new values to validate before applying
    const tempElection = new Election({
      id: this.id,
      name: dto.name,
      desc1: dto.desc1,
      address: dto.address,
      date: dto.date,
      maxAttendees: dto.maxAttendees,
      startTime: dto.startTime,
      endTime: dto.endTime,
      electionStatus: this.electionStatus,
    });
    // Validate the new state before applying changes
    tempElection.validate();

    // Apply changes only if validation passes (data is already validated)
    this.name = dto.name;
    this.desc1 = dto.desc1;
    this.address = dto.address;
    this.date = dto.date;
    this.maxAttendees = dto.maxAttendees;
    this.startTime = dto.startTime;
    this.endTime = dto.endTime;
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
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
