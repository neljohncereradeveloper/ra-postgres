import { DistrictValidationPolicy } from '@domain/policies/district/district-validation.policy';

/**
 * District Domain Model
 *
 * Represents a district within an election.
 * This is a rich domain model that encapsulates business logic and behavior.
 */
export class District {
  id: number;
  electionId: number;
  desc1: string;
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
    this.deletedBy = params.deletedBy;
    this.deletedAt = params.deletedAt;
    this.createdBy = params.createdBy;
    this.createdAt = params.createdAt;
    this.updatedBy = params.updatedBy;
    this.updatedAt = params.updatedAt;
  }

  /**
   * Creates a new district instance with validation
   *
   * This static factory method creates a new district and validates it
   * to ensure it meets all business rules before being persisted.
   *
   * Why static? Because we're creating a NEW instance - there's no existing
   * instance to call the method on. Static methods can be called on the class
   * itself: District.create({...})
   *
   * @param params - District creation parameters
   * @returns A new validated District instance
   * @throws DistrictValidationException - If validation fails
   */
  static create(params: {
    electionId: number;
    desc1: string;
    createdBy?: string;
  }): District {
    const district = new District({
      electionId: params.electionId,
      desc1: params.desc1,
      createdBy: params.createdBy,
      createdAt: new Date(),
    });
    // Validate the district before returning
    district.validate();
    return district;
  }

  /**
   * Updates the district details
   *
   * This method encapsulates the logic for updating district properties.
   * It validates the new state before applying changes to ensure the district
   * remains in a valid state. If validation fails, no changes are applied.
   *
   * @param dto - District data containing fields to update (desc1 is required)
   * @param updatedBy - Username of the user performing the update (required for audit)
   * @throws DistrictValidationException - If validation fails
   */
  update(dto: { desc1: string }, updatedBy: string): void {
    // Create a temporary district with the new values to validate before applying
    const tempDistrict = new District({
      id: this.id,
      electionId: this.electionId,
      desc1: dto.desc1,
    });
    // Validate the new state before applying changes
    tempDistrict.validate();

    // Apply changes only if validation passes (data is already validated)
    this.desc1 = dto.desc1;
    this.updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  /**
   * Archives (soft deletes) the district
   */
  archive(deletedBy: string): void {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
  }

  /**
   * Restores a previously archived district
   */
  restore(): void {
    this.deletedAt = null;
    this.deletedBy = null;
  }

  /**
   * Validates the district against business rules
   *
   * This method enforces domain validation rules such as:
   * - Election ID must be valid
   * - District name must meet length requirements
   * - All required fields must be present
   *
   * @throws DistrictValidationException - If validation fails
   */
  validate(): void {
    new DistrictValidationPolicy().validate(this);
  }
}
