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
  applicationAccess: string[];
  userRoles: string[];
  userName: string;
  password: string;
  deletedBy?: string;
  deletedAt?: Date | null;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;

  constructor(params: {
    id?: number;
    precinct: string;
    watcher: string;
    userRoles: string[];
    applicationAccess: string[];
    userName?: string;
    password?: string;
    deletedBy?: string;
    deletedAt?: Date | null;
    createdBy?: string;
    createdAt?: Date;
    updatedBy?: string;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.precinct = params.precinct;
    this.watcher = params.watcher;
    this.userRoles = params.userRoles;
    this.applicationAccess = params.applicationAccess;
    this.userName = params.userName;
    this.password = params.password;
    this.deletedBy = params.deletedBy;
    this.deletedAt = params.deletedAt;
    this.createdBy = params.createdBy;
    this.createdAt = params.createdAt;
    this.updatedBy = params.updatedBy;
    this.updatedAt = params.updatedAt;
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
    applicationAccess: string[];
    userRoles: string[];
    userName: string;
    password: string;
    createdBy?: string;
  }): User {
    const user = new User({
      precinct: params.precinct,
      watcher: params.watcher,
      applicationAccess: params.applicationAccess,
      userRoles: params.userRoles,
      userName: params.userName,
      password: params.password,
      createdBy: params.createdBy,
      createdAt: getPHDateTime(),
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
    applicationAccess: string[];
    userRoles: string[];
    updatedBy?: string;
  }): void {
    if (this.deletedAt) {
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
      applicationAccess: dto.applicationAccess,
      userRoles: dto.userRoles,
      userName: this.userName,
      password: this.password,
    });
    // Validate the new state before applying changes
    tempUser.validate();

    // Apply changes only if validation passes (data is already validated)
    this.precinct = dto.precinct;
    this.watcher = dto.watcher;
    this.applicationAccess = dto.applicationAccess;
    this.userRoles = dto.userRoles;
    this.updatedBy = dto.updatedBy;
    this.updatedAt = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the user
   */
  archive(deletedBy: string): void {
    // Validate if the user is not already archived
    if (this.deletedAt) {
      throw new UserBusinessException(
        'User is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deletedAt = getPHDateTime();
    this.deletedBy = deletedBy;
  }

  /**
   * Restores a previously archived user
   */
  restore(): void {
    if (!this.deletedAt) {
      throw new UserBusinessException(
        `User with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the user
    this.deletedAt = null;
    this.deletedBy = null;
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
