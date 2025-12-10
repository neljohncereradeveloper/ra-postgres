import { PositionValidationPolicy } from '@domain/policies/position/position-validation.policy';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { PositionBusinessException } from '@domains/exceptions/position/position-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * Position Domain Model
 *
 * Represents a position within an election.
 * This is a rich domain model that encapsulates business logic and behavior.
 */
export class Position {
  id: number;
  electionid: number;
  desc1: string;
  maxcandidates: number;
  termlimit: string;
  deletedby?: string;
  deletedat?: Date | null;
  createdby?: string;
  createdat?: Date;
  updatedby?: string;
  updatedat?: Date;

  constructor(params: {
    id?: number;
    electionid: number;
    desc1: string;
    maxcandidates: number;
    termlimit: string;
    deletedby?: string;
    deletedat?: Date | null;
    createdby?: string;
    createdat?: Date;
    updatedby?: string;
    updatedat?: Date;
  }) {
    this.id = params.id;
    this.electionid = params.electionid;
    this.desc1 = params.desc1;
    this.maxcandidates = params.maxcandidates;
    this.termlimit = params.termlimit;
    this.deletedby = params.deletedby;
    this.deletedat = params.deletedat;
    this.createdby = params.createdby;
    this.createdat = params.createdat;
    this.updatedby = params.updatedby;
    this.updatedat = params.updatedat;
  }

  /**
   * Creates a new position instance with validation
   *
   * This static factory method creates a new position and validates it
   * to ensure it meets all business rules before being persisted.
   *
   * Why static? Because we're creating a NEW instance - there's no existing
   * instance to call the method on. Static methods can be called on the class
   * itself: Position.create({...})
   *
   * @param params - Position creation parameters
   * @returns A new validated Position instance
   * @throws PositionValidationException - If validation fails
   */
  static create(params: {
    electionid: number;
    desc1: string;
    maxcandidates: number;
    termlimit: string;
    createdby?: string;
  }): Position {
    const position = new Position({
      electionid: params.electionid,
      desc1: params.desc1,
      maxcandidates: params.maxcandidates,
      termlimit: params.termlimit,
      createdby: params.createdby,
      createdat: getPHDateTime(),
    });
    // Validate the position before returning
    position.validate();
    return position;
  }

  /**
   * Updates the position details
   *
   * This method encapsulates the logic for updating position properties.
   * It validates the new state before applying changes to ensure the position
   * remains in a valid state. If validation fails, no changes are applied.
   *
   * @param dto - Position data containing fields to update
   * @param updatedBy - Username of the user performing the update (required for audit)
   * @throws PositionValidationException - If validation fails
   */
  update(dto: {
    desc1: string;
    maxcandidates: number;
    termlimit: string;
    updatedby?: string;
  }): void {
    if (this.deletedat) {
      throw new PositionBusinessException(
        'Position is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary position with the new values to validate before applying
    const tempPosition = new Position({
      id: this.id,
      electionid: this.electionid,
      desc1: dto.desc1,
      maxcandidates: dto.maxcandidates,
      termlimit: dto.termlimit,
    });
    // Validate the new state before applying changes
    tempPosition.validate();

    // Apply changes only if validation passes (data is already validated)
    this.desc1 = dto.desc1;
    this.maxcandidates = dto.maxcandidates;
    this.termlimit = dto.termlimit;
    this.updatedby = dto.updatedby;
    this.updatedat = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the position
   */
  archive(deletedby: string): void {
    // Validate if the position is not already archived
    if (this.deletedat) {
      throw new PositionBusinessException(
        'Position is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    // Apply archive operation
    this.deletedat = getPHDateTime();
    this.deletedby = deletedby;
  }

  /**
   * Restores a previously archived position
   */
  restore(): void {
    if (!this.deletedat) {
      throw new PositionBusinessException(
        `Position with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the position
    this.deletedat = null;
    this.deletedby = null;
  }

  /**
   * Validates the position against business rules
   *
   * This method enforces domain validation rules such as:
   * - Election ID must be valid
   * - Position name must meet length requirements
   * - Max candidates must be a positive integer
   * - Term limit must be provided
   * - All required fields must be present
   *
   * @throws PositionValidationException - If validation fails
   */
  validate(): void {
    new PositionValidationPolicy().validate(this);
  }
}
