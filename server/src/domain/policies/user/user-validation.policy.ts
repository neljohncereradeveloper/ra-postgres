// domain/policies/user/user-validation.policy.ts

import { User } from '@domain/models/user.model';
import { UserBusinessException } from '@domains/exceptions/user/user-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * UserValidationPolicy
 *
 * This policy enforces business rules for user validation.
 */
export class UserValidationPolicy {
  /**
   * Validates user data
   *
   * This method enforces domain validation rules such as:
   * - User must not be null
   * - Required fields must be provided and meet length requirements
   * - Fields cannot be empty or just whitespace
   *
   * @param user - The user to validate
   * @throws UserBusinessException - If user validation fails
   */
  validate(user: User): void {
    if (!user) {
      throw new UserBusinessException('User not found', HTTP_STATUS.NOT_FOUND);
    }

    // Validate if precinct is provided
    if (!user.precinct || user.precinct.trim().length === 0) {
      throw new UserBusinessException(
        'Precinct is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if precinct length is within limits (100 characters max based on entity)
    if (user.precinct.length > 100) {
      throw new UserBusinessException(
        'Precinct must not exceed 100 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if precinct has minimum length
    if (user.precinct.trim().length < 3) {
      throw new UserBusinessException(
        'Precinct must be at least 3 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if watcher is provided
    if (!user.watcher || user.watcher.trim().length === 0) {
      throw new UserBusinessException(
        'Watcher is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if watcher length is within limits (255 characters max based on entity)
    if (user.watcher.length > 255) {
      throw new UserBusinessException(
        'Watcher must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if watcher has minimum length
    if (user.watcher.trim().length < 3) {
      throw new UserBusinessException(
        'Watcher must be at least 3 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if applicationAccess is provided
    if (
      !user.application_access ||
      !Array.isArray(user.application_access) ||
      user.application_access.length === 0
    ) {
      throw new UserBusinessException(
        'Application access is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate each application access item
    user.application_access.forEach((access, index) => {
      if (!access || access.trim().length === 0) {
        throw new UserBusinessException(
          `Application access item at index ${index} cannot be empty.`,
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    });

    // Validate if applicationAccess concatenated length is within limits (500 characters max based on entity)
    const applicationAccessString = user.application_access.join(', ');
    if (applicationAccessString.length > 500) {
      throw new UserBusinessException(
        'Application access must not exceed 500 characters when concatenated.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if userRoles is provided
    if (
      !user.user_roles ||
      !Array.isArray(user.user_roles) ||
      user.user_roles.length === 0
    ) {
      throw new UserBusinessException(
        'User roles is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate each user role item
    user.user_roles.forEach((role, index) => {
      if (!role || role.trim().length === 0) {
        throw new UserBusinessException(
          `User role item at index ${index} cannot be empty.`,
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    });

    // Validate if userRoles concatenated length is within limits (500 characters max based on entity)
    const userRolesString = user.user_roles.join(', ');
    if (userRolesString.length > 500) {
      throw new UserBusinessException(
        'User roles must not exceed 500 characters when concatenated.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if username is provided
    if (!user.user_name || user.user_name.trim().length === 0) {
      throw new UserBusinessException(
        'Username is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if username length is within limits (30 characters max based on entity)
    if (user.user_name.length > 30) {
      throw new UserBusinessException(
        'Username must not exceed 30 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if username has minimum length
    if (user.user_name.trim().length < 3) {
      throw new UserBusinessException(
        'Username must be at least 3 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if password is provided
    if (!user.password || user.password.trim().length === 0) {
      throw new UserBusinessException(
        'Password is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if password length is within limits (255 characters max based on entity)
    if (user.password.length > 255) {
      throw new UserBusinessException(
        'Password must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if password has minimum length
    if (user.password.trim().length < 3) {
      throw new UserBusinessException(
        'Password must be at least 3 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
