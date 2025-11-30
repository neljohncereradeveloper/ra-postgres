import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ActivityLogEntity } from '../entities/activity-log.entity';
import { ActivityLog } from '@domain/models/activitylog.model';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';

@Injectable()
export class ActivityLogRepositoryImpl
  implements ActivityLogRepository<EntityManager>
{
  private readonly logger = new Logger(ActivityLogRepositoryImpl.name);

  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly repository: Repository<ActivityLogEntity>,
  ) {}

  async create(
    log: ActivityLog,
    manager: EntityManager,
    username?: string,
  ): Promise<ActivityLog> {
    // Set username in the domain model
    if (username) {
      log.username = username;
    }

    // Convert JSON string to object for jsonb storage
    let detailsJson: any = null;
    if (log.details) {
      try {
        detailsJson =
          typeof log.details === 'string'
            ? JSON.parse(log.details)
            : log.details;
      } catch (error) {
        this.logger.warn(
          `Failed to parse details JSON for activity log: ${error.message}`,
        );
        detailsJson = { raw: log.details };
      }
    }

    // Use raw SQL query for insert
    // Note: user_id is still stored in DB but we're using username in domain model
    const query = `
      INSERT INTO activitylogs (action, entity, details, timestamp, user_id)
      VALUES ($1, $2, $3::jsonb, $4, $5)
      RETURNING id, action, entity, details::text as details, timestamp, user_id
    `;

    // For now, we'll store null for user_id since we're using username in domain
    // This can be updated later if needed to look up user_id from username
    const result = await manager.query(query, [
      log.action,
      log.entity,
      detailsJson ? JSON.stringify(detailsJson) : null,
      log.timestamp || new Date(),
      null, // user_id - can be updated later if needed
    ]);

    const savedRow = result[0];
    return this.rowToModel(savedRow);
  }

  async findAll(): Promise<ActivityLog[]> {
    const query = `
      SELECT 
        id,
        action,
        entity,
        details::text as details,
        timestamp,
        user_id
      FROM activitylogs
      ORDER BY timestamp DESC
    `;

    const rows = await this.repository.query(query);
    return rows.map((row) => this.rowToModel(row));
  }

  async findByEntity(entity: string): Promise<ActivityLog[]> {
    const query = `
      SELECT 
        id,
        action,
        entity,
        details::text as details,
        timestamp,
        user_id
      FROM activitylogs
      WHERE entity = $1
      ORDER BY timestamp DESC
    `;

    const rows = await this.repository.query(query, [entity]);
    return rows.map((row) => this.rowToModel(row));
  }

  async findByAction(action: string): Promise<ActivityLog[]> {
    const query = `
      SELECT 
        id,
        action,
        entity,
        details::text as details,
        timestamp,
        user_id
      FROM activitylogs
      WHERE action = $1
      ORDER BY timestamp DESC
    `;

    const rows = await this.repository.query(query, [action]);
    return rows.map((row) => this.rowToModel(row));
  }

  /**
   * Converts raw database row to domain model
   * Handles conversion from database result (jsonb as text) to domain model
   */
  private rowToModel(row: any): ActivityLog {
    // Details is already converted to text in the SQL query using ::text
    // Handle null/empty cases
    const detailsString = row.details || '';

    const log = new ActivityLog({
      id: row.id,
      action: row.action,
      entity: row.entity,
      details: detailsString,
      timestamp: row.timestamp,
    });

    return log;
  }
}
