import { ActivityLog } from '@domain/models/activitylog.model';

export interface ActivityLogRepository<Context = unknown> {
  // Create with transaction activity log entry
  create(log: ActivityLog, context: Context): Promise<ActivityLog>;

  // Find all activity logs
  findAll(): Promise<ActivityLog[]>;

  // Find activity logs by entity
  findByEntity(entity: string): Promise<ActivityLog[]>;

  // Find activity logs by action
  findByAction(action: string): Promise<ActivityLog[]>;
}
