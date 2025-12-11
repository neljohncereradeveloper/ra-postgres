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
  election_id: number;
  desc1: string;
  max_candidates: number;
  term_limit: string;
  sort_order?: number;
  deleted_by?: string;
  deleted_at?: Date | null;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;

  constructor(params: {
    id?: number;
    election_id: number;
    desc1: string;
    max_candidates: number;
    term_limit: string;
    sort_order?: number;
    deleted_by?: string;
    deleted_at?: Date | null;
    created_by?: string;
    created_at?: Date;
    updated_by?: string;
    updated_at?: Date;
  }) {
    this.id = params.id;
    this.election_id = params.election_id;
    this.desc1 = params.desc1;
    this.max_candidates = params.max_candidates;
    this.term_limit = params.term_limit;
    this.sort_order = params.sort_order;
    this.deleted_by = params.deleted_by;
    this.deleted_at = params.deleted_at;
    this.created_by = params.created_by;
    this.created_at = params.created_at;
    this.updated_by = params.updated_by;
    this.updated_at = params.updated_at;
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
    election_id: number;
    desc1: string;
    max_candidates: number;
    term_limit: string;
    sort_order?: number;
    created_by?: string;
  }): Position {
    const position = new Position({
      election_id: params.election_id,
      desc1: params.desc1,
      max_candidates: params.max_candidates,
      term_limit: params.term_limit,
      sort_order: params.sort_order,
      created_by: params.created_by,
      created_at: getPHDateTime(),
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
    max_candidates: number;
    term_limit: string;
    sort_order?: number;
    updated_by?: string;
  }): void {
    if (this.deleted_at) {
      throw new PositionBusinessException(
        'Position is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary position with the new values to validate before applying
    const tempPosition = new Position({
      id: this.id,
      election_id: this.election_id,
      desc1: dto.desc1,
      max_candidates: dto.max_candidates,
      term_limit: dto.term_limit,
    });
    // Validate the new state before applying changes
    tempPosition.validate();

    // Apply changes only if validation passes (data is already validated)
    this.desc1 = dto.desc1;
    this.max_candidates = dto.max_candidates;
    this.term_limit = dto.term_limit;
    this.sort_order = dto.sort_order;
    this.updated_by = dto.updated_by;
    this.updated_at = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the position
   */
  archive(deleted_by: string): void {
    // Validate if the position is not already archived
    if (this.deleted_at) {
      throw new PositionBusinessException(
        'Position is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    // Apply archive operation
    this.deleted_at = getPHDateTime();
    this.deleted_by = deleted_by;
  }

  /**
   * Restores a previously archived position
   */
  restore(): void {
    if (!this.deleted_at) {
      throw new PositionBusinessException(
        `Position with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the position
    this.deleted_at = null;
    this.deleted_by = null;
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
