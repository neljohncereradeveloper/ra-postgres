import { UserValidationPolicy } from '@domain/policies/user/user-validation.policy';
import { getPHDateTime } from '@domain/utils/format-ph-time';
import { UserBusinessException } from '@domains/exceptions/user/user-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * User Domain Model
 *
 * Represents a user.
 * This is a rich domain model that encapsulates business logic and behavior.
 */
export class User {
  id: number;
  precinct: string;
  watcher: string;
  application_access: string[];
  user_roles: string[];
  user_name: string;
  password: string;
  deleted_by?: string;
  deleted_at?: Date | null;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;

  constructor(params: {
    id?: number;
    precinct: string;
    watcher: string;
    user_roles: string[];
    application_access: string[];
    user_name?: string;
    password?: string;
    deleted_by?: string;
    deleted_at?: Date | null;
    created_by?: string;
    created_at?: Date;
    updated_by?: string;
    updated_at?: Date;
  }) {
    this.id = params.id;
    this.precinct = params.precinct;
    this.watcher = params.watcher;
    this.user_roles = params.user_roles;
    this.application_access = params.application_access;
    this.user_name = params.user_name;
    this.password = params.password;
    this.deleted_by = params.deleted_by;
    this.deleted_at = params.deleted_at;
    this.created_by = params.created_by;
    this.created_at = params.created_at;
    this.updated_by = params.updated_by;
    this.updated_at = params.updated_at;
  }

  /**
   * Creates a new user instance with validation
   *
   * This static factory method creates a new user and validates it
   * to ensure it meets all business rules before being persisted.
   *
   * Why static? Because we're creating a NEW instance - there's no existing
   * instance to call the method on. Static methods can be called on the class
   * itself: User.create({...})
   *
   * @param params - User creation parameters
   * @returns A new validated User instance
   * @throws UserBusinessException - If validation fails
   */
  static create(params: {
    precinct: string;
    watcher: string;
    application_access: string[];
    user_roles: string[];
    user_name: string;
    password: string;
    created_by?: string;
  }): User {
    const user = new User({
      precinct: params.precinct,
      watcher: params.watcher,
      application_access: params.application_access,
      user_roles: params.user_roles,
      user_name: params.user_name,
      password: params.password,
      created_by: params.created_by,
      created_at: getPHDateTime(),
    });
    // Validate the user before returning
    user.validate();
    return user;
  }

  /**
   * Updates the user details
   *
   * This method encapsulates the logic for updating user properties.
   * It validates the new state before applying changes to ensure the user
   * remains in a valid state. If validation fails, no changes are applied.
   *
   * @param dto - User data containing fields to update
   * @param updatedBy - Username of the user performing the update (required for audit)
   * @throws UserBusinessException - If validation fails
   */
  update(dto: {
    precinct: string;
    watcher: string;
    application_access: string[];
    user_roles: string[];
    updated_by?: string;
  }): void {
    if (this.deleted_at) {
      throw new UserBusinessException(
        'User is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary user with the new values to validate before applying
    const tempUser = new User({
      id: this.id,
      precinct: dto.precinct,
      watcher: dto.watcher,
      application_access: dto.application_access,
      user_roles: dto.user_roles,
      user_name: this.user_name,
      password: this.password,
    });
    // Validate the new state before applying changes
    tempUser.validate();

    // Apply changes only if validation passes (data is already validated)
    this.precinct = dto.precinct;
    this.watcher = dto.watcher;
    this.application_access = dto.application_access;
    this.user_roles = dto.user_roles;
    this.updated_by = dto.updated_by;
    this.updated_at = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the user
   */
  archive(deleted_by: string): void {
    // Validate if the user is not already archived
    if (this.deleted_at) {
      throw new UserBusinessException(
        'User is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deleted_at = getPHDateTime();
    this.deleted_by = deleted_by;
  }

  /**
   * Restores a previously archived user
   */
  restore(): void {
    if (!this.deleted_at) {
      throw new UserBusinessException(
        `User with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the user
    this.deleted_at = null;
    this.deleted_by = null;
  }

  /**
   * Validates the user against business rules
   *
   * This method enforces domain validation rules such as:
   * - Required fields must be present and meet length requirements
   * - Fields cannot be empty or just whitespace
   *
   * @throws UserBusinessException - If validation fails
   */
  validate(): void {
    new UserValidationPolicy().validate(this);
  }
}
