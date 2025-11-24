export class ActivityLog {
  id: number;
  action: string; // e.g., 'CREATE_CLIENT', 'UPDATE_CLIENT', 'DELETE_CLIENT'
  entity: string; // e.g., 'Client'
  details: string; // JSON string containing the details of the activity
  timestamp: Date; // Date and time when the activity occurred
  userId: number;

  constructor(
    action: string,
    entity: string,
    details: string,
    timestamp: Date,
    userId: number,
  ) {
    this.action = action;
    this.entity = entity;
    this.details = details;
    this.timestamp = timestamp;
    this.userId = userId;
  }

  // Business logic: Parse details as JSON
  getParsedDetails(): object {
    try {
      return JSON.parse(this.details);
    } catch (error) {
      return {};
    }
  }
}
