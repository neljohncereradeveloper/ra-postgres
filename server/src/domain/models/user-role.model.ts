import { UserRoleValidationPolicy } from '@domain/policies/user-role/user-role-validation.policy';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { UserRoleBusinessException } from '@domains/exceptions/user-role/user-role-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * UserRole Domain Model
 *
 * Represents a user role.
 * This is a rich domain model that encapsulates business logic and behavior.
 */
export class UserRole {
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
   * Creates a new user role instance with validation
   *
   * This static factory method creates a new user role and validates it
   * to ensure it meets all business rules before being persisted.
   *
   * Why static? Because we're creating a NEW instance - there's no existing
   * instance to call the method on. Static methods can be called on the class
   * itself: UserRole.create({...})
   *
   * @param params - User role creation parameters
   * @returns A new validated UserRole instance
   * @throws UserRoleBusinessException - If validation fails
   */
  static create(params: { desc1: string; createdby?: string }): UserRole {
    const userRole = new UserRole({
      desc1: params.desc1,
      createdby: params.createdby,
      createdat: getPHDateTime(),
    });
    // Validate the user role before returning
    userRole.validate();
    return userRole;
  }

  /**
   * Updates the user role details
   *
   * This method encapsulates the logic for updating user role properties.
   * It validates the new state before applying changes to ensure the user role
   * remains in a valid state. If validation fails, no changes are applied.
   *
   * @param dto - User role data containing fields to update (desc1 is required)
   * @param updatedBy - Username of the user performing the update (required for audit)
   * @throws UserRoleBusinessException - If validation fails
   */
  update(dto: { desc1: string; updatedby?: string }): void {
    if (this.deletedat) {
      throw new UserRoleBusinessException(
        'User role is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary user role with the new values to validate before applying
    const tempUserRole = new UserRole({
      id: this.id,
      desc1: dto.desc1,
    });
    // Validate the new state before applying changes
    tempUserRole.validate();

    // Apply changes only if validation passes (data is already validated)
    this.desc1 = dto.desc1;
    this.updatedby = dto.updatedby;
    this.updatedat = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the user role
   */
  archive(deletedby: string): void {
    // Validate if the user role is not already archived
    if (this.deletedat) {
      throw new UserRoleBusinessException(
        'User role is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deletedat = getPHDateTime();
    this.deletedby = deletedby;
  }

  /**
   * Restores a previously archived user role
   */
  restore(): void {
    if (!this.deletedat) {
      throw new UserRoleBusinessException(
        `User role with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the user role
    this.deletedat = null;
    this.deletedby = null;
  }

  /**
   * Validates the user role against business rules
   *
   * This method enforces domain validation rules such as:
   * - User role name must meet length requirements
   * - All required fields must be present
   *
   * @throws UserRoleBusinessException - If validation fails
   */
  validate(): void {
    new UserRoleValidationPolicy().validate(this);
  }
}
