import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ActivityLog } from '@domain/models/activitylog.model';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';

@Injectable()
export class ActivityLogRepositoryImpl
  implements ActivityLogRepository<EntityManager>
{
  private readonly logger = new Logger(ActivityLogRepositoryImpl.name);

  constructor(private readonly dataSource: DataSource) {}

  async create(log: ActivityLog, manager: EntityManager): Promise<ActivityLog> {
    // Convert JSON string to object for JSON storage
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
    const query = `
      INSERT INTO activitylogs (action, entity, details, timestamp, username)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await manager.query(query, [
      log.action,
      log.entity,
      detailsJson ? JSON.stringify(detailsJson) : null,
      log.timestamp || new Date(),
      log.username || null,
    ]);

    // Get the inserted row
    const insertId = result.insertId;
    const selectQuery = `
      SELECT 
        id,
        action,
        entity,
        details,
        timestamp,
        username
      FROM activitylogs
      WHERE id = ?
    `;

    const savedRow = await manager.query(selectQuery, [insertId]);
    return this.rowToModel(savedRow[0]);
  }

  async findAll(): Promise<ActivityLog[]> {
    const query = `
      SELECT 
        id,
        action,
        entity,
        details,
        timestamp,
        username
      FROM activitylogs
      ORDER BY timestamp DESC
    `;

    const rows = await this.dataSource.query(query);
    return rows.map((row) => this.rowToModel(row));
  }

  async findByEntity(entity: string): Promise<ActivityLog[]> {
    const query = `
      SELECT 
        id,
        action,
        entity,
        details,
        timestamp,
        username
      FROM activitylogs
      WHERE entity = ?
      ORDER BY timestamp DESC
    `;

    const rows = await this.dataSource.query(query, [entity]);
    return rows.map((row) => this.rowToModel(row));
  }

  async findByAction(action: string): Promise<ActivityLog[]> {
    const query = `
      SELECT 
        id,
        action,
        entity,
        details,
        timestamp,
        username
      FROM activitylogs
      WHERE action = ?
      ORDER BY timestamp DESC
    `;

    const rows = await this.dataSource.query(query, [action]);
    return rows.map((row) => this.rowToModel(row));
  }

  /**
   * Converts raw database row to domain model
   * Handles conversion from database result (JSON) to domain model
   */
  private rowToModel(row: any): ActivityLog {
    // Handle JSON details - MySQL returns JSON as string or object depending on version
    let detailsString = '';
    if (row.details) {
      if (typeof row.details === 'string') {
        detailsString = row.details;
      } else {
        detailsString = JSON.stringify(row.details);
      }
    }

    const log = new ActivityLog({
      id: row.id,
      action: row.action,
      entity: row.entity,
      details: detailsString,
      timestamp: row.timestamp,
      username: row.username,
    });

    return log;
  }
}
