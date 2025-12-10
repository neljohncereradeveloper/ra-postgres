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
  electionid: number;
  desc1: string;
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
    this.deletedby = params.deletedby;
    this.deletedat = params.deletedat;
    this.createdby = params.createdby;
    this.createdat = params.createdat;
    this.updatedby = params.updatedby;
    this.updatedat = params.updatedat;
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
    electionid: number;
    desc1: string;
    createdby?: string;
  }): District {
    const district = new District({
      electionid: params.electionid,
      desc1: params.desc1,
      createdby: params.createdby,
      createdat: getPHDateTime(),
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
  update(dto: { desc1: string; updatedby?: string }): void {
    if (this.deletedat) {
      throw new DistrictBusinessException(
        'District is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary district with the new values to validate before applying
    const tempDistrict = new District({
      id: this.id,
      electionid: this.electionid,
      desc1: dto.desc1,
    });
    // Validate the new state before applying changes
    tempDistrict.validate();

    // Apply changes only if validation passes (data is already validated)
    this.desc1 = dto.desc1;
    this.updatedby = dto.updatedby;
    this.updatedat = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the district
   */
  archive(deletedby: string): void {
    // Validate if the district is not already archived
    if (this.deletedat) {
      throw new DistrictBusinessException(
        'District is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deletedat = getPHDateTime();
    this.deletedby = deletedby;
  }

  /**
   * Restores a previously archived district
   */
  restore(): void {
    if (!this.deletedat) {
      throw new DistrictBusinessException(
        `District with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the district
    this.deletedat = null;
    this.deletedby = null;
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
