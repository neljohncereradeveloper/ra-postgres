import { PrecinctValidationPolicy } from '@domain/policies/precinct/precinct-validation.policy';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { PrecinctBusinessException } from '@domains/exceptions/precinct/precinct-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * Precinct Domain Model
 *
 * Represents a precinct within the system.
 * This is a rich domain model that encapsulates business logic and behavior.
 */
export class Precinct {
  id: number;
  desc1: string;
  deleted_by?: string;
  deleted_at?: Date | null;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;

  constructor(params: {
    id?: number;
    desc1: string;
    deleted_by?: string;
    deleted_at?: Date | null;
    created_by?: string;
    created_at?: Date;
    updated_by?: string;
    updated_at?: Date;
  }) {
    this.id = params.id;
    this.desc1 = params.desc1;
    this.deleted_by = params.deleted_by;
    this.deleted_at = params.deleted_at;
    this.created_by = params.created_by;
    this.created_at = params.created_at;
    this.updated_by = params.updated_by;
    this.updated_at = params.updated_at;
  }

  /**
   * Creates a new precinct instance with validation
   *
   * This static factory method creates a new precinct and validates it
   * to ensure it meets all business rules before being persisted.
   *
   * Why static? Because we're creating a NEW instance - there's no existing
   * instance to call the method on. Static methods can be called on the class
   * itself: Precinct.create({...})
   *
   * @param params - Precinct creation parameters
   * @returns A new validated Precinct instance
   * @throws PrecinctBusinessValidationException - If validation fails
   */
  static create(params: { desc1: string; created_by?: string }): Precinct {
    const precinct = new Precinct({
      desc1: params.desc1,
      created_by: params.created_by,
      created_at: getPHDateTime(),
    });
    // Validate the precinct before returning
    precinct.validate();
    return precinct;
  }

  /**
   * Updates the precinct details
   *
   * This method encapsulates the logic for updating precinct properties.
   * It validates the new state before applying changes to ensure the precinct
   * remains in a valid state. If validation fails, no changes are applied.
   *
   * @param dto - Precinct data containing fields to update (desc1 is required)
   * @param updatedBy - Username of the user performing the update (required for audit)
   * @throws PrecinctBusinessValidationException - If validation fails
   */
  update(dto: { desc1: string; updated_by?: string }): void {
    if (this.deleted_at) {
      throw new PrecinctBusinessException(
        'Precinct is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary precinct with the new values to validate before applying
    const tempPrecinct = new Precinct({
      id: this.id,
      desc1: dto.desc1,
    });
    // Validate the new state before applying changes
    tempPrecinct.validate();

    // Apply changes only if validation passes (data is already validated)
    this.desc1 = dto.desc1;
    this.updated_by = dto.updated_by;
    this.updated_at = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the precinct
   *
   * @param deletedBy - Username of the user performing the archive
   * @throws PrecinctBusinessValidationException - If the precinct cannot be archived
   */
  archive(deleted_by: string): void {
    // Validate if the precinct is not already archived
    if (this.deleted_at) {
      throw new PrecinctBusinessException(
        'Precinct is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    // Apply archive operation
    this.deleted_at = getPHDateTime();
    this.deleted_by = deleted_by;
  }

  /**
   * Restores a previously archived precinct
   */
  restore(): void {
    if (!this.deleted_at) {
      throw new PrecinctBusinessException(
        `Precinct with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the precinct
    this.deleted_at = null;
    this.deleted_by = null;
  }

  /**
   * Validates the precinct against business rules
   *
   * This method enforces domain validation rules such as:
   * - Precinct name must meet length requirements
   * - All required fields must be present
   *
   * @throws PrecinctBusinessValidationException - If validation fails
   */
  validate(): void {
    new PrecinctValidationPolicy().validate(this);
  }
}
