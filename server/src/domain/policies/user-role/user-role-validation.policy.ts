// domain/policies/user-role/user-role-validation.policy.ts

import { UserRole } from '@domain/models/user-role.model';
import { UserRoleBusinessException } from '@domains/exceptions/user-role/user-role-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * UserRoleValidationPolicy
 *
 * This policy enforces business rules for user role validation.
 */
export class UserRoleValidationPolicy {
  /**
   * Validates user role data
   *
   * This method enforces domain validation rules such as:
   * - User role must not be null
   * - User role name (desc1) must be provided and meet length requirements (3-255 characters)
   * - User role name cannot be empty or just whitespace
   *
   * @param userRole - The user role to validate
   * @throws UserRoleBusinessException - If user role validation fails
   */
  validate(userRole: UserRole): void {
    if (!userRole) {
      throw new UserRoleBusinessException(
        'User role not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if desc1 is provided
    if (!userRole.desc1 || userRole.desc1.trim().length === 0) {
      throw new UserRoleBusinessException(
        'User role name is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 length is within limits (255 characters max based on entity)
    if (userRole.desc1.length > 255) {
      throw new UserRoleBusinessException(
        'User role name must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 has minimum length
    if (userRole.desc1.trim().length < 3) {
      throw new UserRoleBusinessException(
        'User role name must be at least 3 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
