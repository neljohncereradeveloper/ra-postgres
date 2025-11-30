import { PositionValidationPolicy } from '@domain/policies/position/position-validation.policy';

/**
 * Position Domain Model
 *
 * Represents a position within an election.
 * This is a rich domain model that encapsulates business logic and behavior.
 */
export class Position {
  id: number;
  electionId: number;
  desc1: string;
  maxCandidates: number;
  termLimit: string;
  deletedBy?: string;
  deletedAt?: Date | null;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;

  constructor(params: {
    id?: number;
    electionId: number;
    desc1: string;
    maxCandidates: number;
    termLimit: string;
    deletedBy?: string;
    deletedAt?: Date | null;
    createdBy?: string;
    createdAt?: Date;
    updatedBy?: string;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.electionId = params.electionId;
    this.desc1 = params.desc1;
    this.maxCandidates = params.maxCandidates;
    this.termLimit = params.termLimit;
    this.deletedBy = params.deletedBy;
    this.deletedAt = params.deletedAt;
    this.createdBy = params.createdBy;
    this.createdAt = params.createdAt;
    this.updatedBy = params.updatedBy;
    this.updatedAt = params.updatedAt;
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
    electionId: number;
    desc1: string;
    maxCandidates: number;
    termLimit: string;
    createdBy?: string;
  }): Position {
    const position = new Position({
      electionId: params.electionId,
      desc1: params.desc1,
      maxCandidates: params.maxCandidates,
      termLimit: params.termLimit,
      createdBy: params.createdBy,
      createdAt: new Date(),
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
  update(
    dto: { desc1: string; maxCandidates: number; termLimit: string },
    updatedBy: string,
  ): void {
    // Create a temporary position with the new values to validate before applying
    const tempPosition = new Position({
      id: this.id,
      electionId: this.electionId,
      desc1: dto.desc1,
      maxCandidates: dto.maxCandidates,
      termLimit: dto.termLimit,
    });
    // Validate the new state before applying changes
    tempPosition.validate();

    // Apply changes only if validation passes (data is already validated)
    this.desc1 = dto.desc1;
    this.maxCandidates = dto.maxCandidates;
    this.termLimit = dto.termLimit;
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  /**
   * Archives (soft deletes) the position
   */
  archive(deletedBy: string): void {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
  }

  /**
   * Restores a previously archived position
   */
  restore(): void {
    this.deletedAt = null;
    this.deletedBy = null;
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
