import { ApplicationAccessValidationPolicy } from '@domain/policies/application-access/application-access-validation.policy';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { ApplicationAccessBusinessException } from '@domains/exceptions/application-access/application-access-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * ApplicationAccess Domain Model
 *
 * Represents an application access permission.
 * This is a rich domain model that encapsulates business logic and behavior.
 */
export class ApplicationAccess {
  id: number;
  desc1: string;
  deletedby?: string;
  deletedat?: Date | null;
  createdby?: string;
  createdat?: Date;
  updatedby?: string;
  updatedat?: Date;

  constructor(params: {
    id?: number;
    desc1: string;
    deletedby?: string;
    deletedat?: Date | null;
    createdby?: string;
    createdat?: Date;
    updatedby?: string;
    updatedat?: Date;
  }) {
    this.id = params.id;
    this.desc1 = params.desc1;
    this.deletedby = params.deletedby;
    this.deletedat = params.deletedat;
    this.createdby = params.createdby;
    this.createdat = params.createdat;
    this.updatedby = params.updatedby;
    this.updatedat = params.updatedat;
  }

  /**
   * Creates a new application access instance with validation
   *
   * This static factory method creates a new application access and validates it
   * to ensure it meets all business rules before being persisted.
   *
   * Why static? Because we're creating a NEW instance - there's no existing
   * instance to call the method on. Static methods can be called on the class
   * itself: ApplicationAccess.create({...})
   *
   * @param params - Application access creation parameters
   * @returns A new validated ApplicationAccess instance
   * @throws ApplicationAccessBusinessException - If validation fails
   */
  static create(params: {
    desc1: string;
    createdby?: string;
  }): ApplicationAccess {
    const applicationAccess = new ApplicationAccess({
      desc1: params.desc1,
      createdby: params.createdby,
      createdat: getPHDateTime(),
    });
    // Validate the application access before returning
    applicationAccess.validate();
    return applicationAccess;
  }

  /**
   * Updates the application access details
   *
   * This method encapsulates the logic for updating application access properties.
   * It validates the new state before applying changes to ensure the application access
   * remains in a valid state. If validation fails, no changes are applied.
   *
   * @param dto - Application access data containing fields to update (desc1 is required)
   * @param updatedBy - Username of the user performing the update (required for audit)
   * @throws ApplicationAccessBusinessException - If validation fails
   */
  update(dto: { desc1: string; updatedby?: string }): void {
    if (this.deletedat) {
      throw new ApplicationAccessBusinessException(
        'Application access is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary application access with the new values to validate before applying
    const tempApplicationAccess = new ApplicationAccess({
      id: this.id,
      desc1: dto.desc1,
    });
    // Validate the new state before applying changes
    tempApplicationAccess.validate();

    // Apply changes only if validation passes (data is already validated)
    this.desc1 = dto.desc1;
    this.updatedby = dto.updatedby;
    this.updatedat = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the application access
   */
  archive(deletedby: string): void {
    // Validate if the application access is not already archived
    if (this.deletedat) {
      throw new ApplicationAccessBusinessException(
        'Application access is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deletedat = getPHDateTime();
    this.deletedby = deletedby;
  }

  /**
   * Restores a previously archived application access
   */
  restore(): void {
    if (!this.deletedat) {
      throw new ApplicationAccessBusinessException(
        `Application access with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the application access
    this.deletedat = null;
    this.deletedby = null;
  }

  /**
   * Validates the application access against business rules
   *
   * This method enforces domain validation rules such as:
   * - Application access name must meet length requirements
   * - All required fields must be present
   *
   * @throws ApplicationAccessBusinessException - If validation fails
   */
  validate(): void {
    new ApplicationAccessValidationPolicy().validate(this);
  }
}
