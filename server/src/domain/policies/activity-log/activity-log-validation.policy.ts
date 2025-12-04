// domain/policies/activity-log/activity-log-validation.policy.ts

import { ActivityLog } from '@domain/models/activitylog.model';
import { ActivityLogBusinessException } from '@domains/exceptions/activity-log/activity-log-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * ActivityLogValidationPolicy
 *
 * This policy enforces basic validation rules for activity log entries.
 * Note: Validation is minimal to ensure log entries are well-formed,
 * but not too strict since audit logs should capture events as they occur.
 */
export class ActivityLogValidationPolicy {
  /**
   * Validates activity log data
   *
   * This method enforces basic validation rules such as:
   * - Activity log must not be null
   * - Action must be provided and not empty (max 100 characters)
   * - Entity must be provided and not empty (max 100 characters)
   * - Timestamp must be a valid date
   *
   * @param activityLog - The activity log to validate
   * @throws ActivityLogValidationException - If activity log validation fails
   */
  validate(activityLog: ActivityLog): void {
    if (!activityLog) {
      throw new ActivityLogBusinessException(
        'Activity log not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if action is provided
    if (!activityLog.action || activityLog.action.trim().length === 0) {
      throw new ActivityLogBusinessException(
        'Action is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if action length is within limits (100 characters max based on entity)
    if (activityLog.action.length > 100) {
      throw new ActivityLogBusinessException(
        'Action must not exceed 100 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if entity is provided
    if (!activityLog.entity || activityLog.entity.trim().length === 0) {
      throw new ActivityLogBusinessException(
        'Entity is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if entity length is within limits (100 characters max based on entity)
    if (activityLog.entity.length > 100) {
      throw new ActivityLogBusinessException(
        'Entity must not exceed 100 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if timestamp is a valid date
    if (
      !activityLog.timestamp ||
      !(activityLog.timestamp instanceof Date) ||
      isNaN(activityLog.timestamp.getTime())
    ) {
      throw new ActivityLogBusinessException(
        'Timestamp must be a valid date.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
