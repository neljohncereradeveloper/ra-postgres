import { DistrictValidationPolicy } from '@domain/policies/district/district-validation.policy';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { DistrictBusinessException } from '@domains/exceptions/district/district-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * District Domain Model
 *
 * Represents a district within an election.
 * This is a rich domain model that encapsulates business logic and behavior.
 */
export class District {
  id: number;
  election_id: number;
  desc1: string;
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
    this.deleted_by = params.deleted_by;
    this.deleted_at = params.deleted_at;
    this.created_by = params.created_by;
    this.created_at = params.created_at;
    this.updated_by = params.updated_by;
    this.updated_at = params.updated_at;
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
    election_id: number;
    desc1: string;
    created_by?: string;
  }): District {
    const district = new District({
      election_id: params.election_id,
      desc1: params.desc1,
      created_by: params.created_by,
      created_at: getPHDateTime(),
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
  update(dto: { desc1: string; updated_by?: string }): void {
    if (this.deleted_at) {
      throw new DistrictBusinessException(
        'District is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary district with the new values to validate before applying
    const tempDistrict = new District({
      id: this.id,
      election_id: this.election_id,
      desc1: dto.desc1,
    });
    // Validate the new state before applying changes
    tempDistrict.validate();

    // Apply changes only if validation passes (data is already validated)
    this.desc1 = dto.desc1;
    this.updated_by = dto.updated_by;
    this.updated_at = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the district
   */
  archive(deleted_by: string): void {
    // Validate if the district is not already archived
    if (this.deleted_at) {
      throw new DistrictBusinessException(
        'District is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deleted_at = getPHDateTime();
    this.deleted_by = deleted_by;
  }

  /**
   * Restores a previously archived district
   */
  restore(): void {
    if (!this.deleted_at) {
      throw new DistrictBusinessException(
        `District with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the district
    this.deleted_at = null;
    this.deleted_by = null;
  }

  /**
   * Validates the district against business rules
   *
   * This method enforces domain validation rules such as:
   * - Election ID must be valid
   * - District name must meet length requirements
   * - All required fields must be present
   *
   * @throws DistrictBusinessException - If validation fails
   */
  validate(): void {
    new DistrictValidationPolicy().validate(this);
  }
}
