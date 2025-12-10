import { ActivityLogValidationPolicy } from '@domain/policies/activity-log/activity-log-validation.policy';
import { getPHDateTime } from '@domain/utils/format-ph-time';

/**
 * ActivityLog Domain Model
 *
 * Represents an audit log entry for tracking system activities.
 * This is a rich domain model that encapsulates business logic and behavior.
 * Activity logs are immutable once created - they serve as an audit trail.
 */
export class ActivityLog {
  id: number;
  action: string; // e.g., 'CREATE_CLIENT', 'UPDATE_CLIENT', 'DELETE_CLIENT'
  entity: string; // e.g., 'Client'
  details: string; // JSON string containing the details of the activity
  occurred_at: Date; // Date and time when the activity occurred
  user_name: string;

  constructor(params: {
    id?: number;
    action: string;
    entity: string;
    details: string;
    occurred_at: Date;
    user_name?: string;
  }) {
    this.id = params.id;
    this.action = params.action;
    this.entity = params.entity;
    this.details = params.details;
    this.occurred_at = params.occurred_at;
    this.user_name = params.user_name;
  }

  /**
   * Creates a new activity log entry
   *
   * This static factory method creates a new activity log entry with proper
   * initialization. Activity logs are immutable audit records that track
   * system activities.
   *
   * Why static? Because we're creating a NEW instance - there's no existing
   * instance to call the method on. Static methods can be called on the class
   * itself: ActivityLog.create({...})
   *
   * @param params - Activity log creation parameters
   * @returns A new ActivityLog instance
   */
  static create(params: {
    action: string;
    entity: string;
    details: string;
    user_name?: string;
  }): ActivityLog {
    const activityLog = new ActivityLog({
      action: params.action,
      entity: params.entity,
      details: params.details,
      occurred_at: getPHDateTime(),
      user_name: params.user_name,
    });
    // Validate the activity log before returning
    activityLog.validate();
    return activityLog;
  }

  /**
   * Validates the activity log against business rules
   *
   * This method enforces basic validation rules such as:
   * - Action must be provided and within length limits
   * - Entity must be provided and within length limits
   * - Timestamp must be a valid date
   *
   * @throws ActivityLogValidationException - If validation fails
   */
  validate(): void {
    new ActivityLogValidationPolicy().validate(this);
  }
}
