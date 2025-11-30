// domain/policies/activity-log/activity-log-validation.policy.ts

import { ActivityLog } from '@domain/models/activitylog.model';
import { ActivityLogValidationException } from '@domains/exceptions/activity-log/activity-log-validation.exception';

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
      throw new ActivityLogValidationException('Activity log not found');
    }

    // Validate if action is provided
    if (!activityLog.action || activityLog.action.trim().length === 0) {
      throw new ActivityLogValidationException(
        'Action is required and cannot be empty.',
      );
    }

    // Validate if action length is within limits (100 characters max based on entity)
    if (activityLog.action.length > 100) {
      throw new ActivityLogValidationException(
        'Action must not exceed 100 characters.',
      );
    }

    // Validate if entity is provided
    if (!activityLog.entity || activityLog.entity.trim().length === 0) {
      throw new ActivityLogValidationException(
        'Entity is required and cannot be empty.',
      );
    }

    // Validate if entity length is within limits (100 characters max based on entity)
    if (activityLog.entity.length > 100) {
      throw new ActivityLogValidationException(
        'Entity must not exceed 100 characters.',
      );
    }

    // Validate if timestamp is a valid date
    if (
      !activityLog.timestamp ||
      !(activityLog.timestamp instanceof Date) ||
      isNaN(activityLog.timestamp.getTime())
    ) {
      throw new ActivityLogValidationException(
        'Timestamp must be a valid date.',
      );
    }
  }
}
