// domain/policies/application-access/application-access-validation.policy.ts

import { ApplicationAccess } from '@domain/models/application-access.model';
import { ApplicationAccessBusinessException } from '@domains/exceptions/application-access/application-access-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * ApplicationAccessValidationPolicy
 *
 * This policy enforces business rules for application access validation.
 */
export class ApplicationAccessValidationPolicy {
  /**
   * Validates application access data
   *
   * This method enforces domain validation rules such as:
   * - Application access must not be null
   * - Application access name (desc1) must be provided and meet length requirements (3-255 characters)
   * - Application access name cannot be empty or just whitespace
   *
   * @param applicationAccess - The application access to validate
   * @throws ApplicationAccessBusinessException - If application access validation fails
   */
  validate(applicationAccess: ApplicationAccess): void {
    if (!applicationAccess) {
      throw new ApplicationAccessBusinessException(
        'Application access not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if desc1 is provided
    if (
      !applicationAccess.desc1 ||
      applicationAccess.desc1.trim().length === 0
    ) {
      throw new ApplicationAccessBusinessException(
        'Application access name is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 length is within limits (255 characters max based on entity)
    if (applicationAccess.desc1.length > 255) {
      throw new ApplicationAccessBusinessException(
        'Application access name must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if desc1 has minimum length
    if (applicationAccess.desc1.trim().length < 3) {
      throw new ApplicationAccessBusinessException(
        'Application access name must be at least 3 characters long.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
