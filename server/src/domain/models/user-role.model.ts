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
  deletedBy?: string;
  deletedAt?: Date | null;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;

  constructor(params: {
    id?: number;
    desc1: string;
    deletedBy?: string;
    deletedAt?: Date | null;
    createdBy?: string;
    createdAt?: Date;
    updatedBy?: string;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.desc1 = params.desc1;
    this.deletedBy = params.deletedBy;
    this.deletedAt = params.deletedAt;
    this.createdBy = params.createdBy;
    this.createdAt = params.createdAt;
    this.updatedBy = params.updatedBy;
    this.updatedAt = params.updatedAt;
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
  static create(params: { desc1: string; createdBy?: string }): UserRole {
    const userRole = new UserRole({
      desc1: params.desc1,
      createdBy: params.createdBy,
      createdAt: getPHDateTime(),
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
  update(dto: { desc1: string; updatedBy?: string }): void {
    if (this.deletedAt) {
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
    this.updatedBy = dto.updatedBy;
    this.updatedAt = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the user role
   */
  archive(deletedBy: string): void {
    // Validate if the user role is not already archived
    if (this.deletedAt) {
      throw new UserRoleBusinessException(
        'User role is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deletedAt = getPHDateTime();
    this.deletedBy = deletedBy;
  }

  /**
   * Restores a previously archived user role
   */
  restore(): void {
    if (!this.deletedAt) {
      throw new UserRoleBusinessException(
        `User role with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the user role
    this.deletedAt = null;
    this.deletedBy = null;
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
