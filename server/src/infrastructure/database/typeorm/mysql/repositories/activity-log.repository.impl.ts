import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ActivityLog } from '@domain/models/activitylog.model';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { getFirstRow, extractRows } from '@shared/utils/query-result.util';

@Injectable()
export class ActivityLogRepositoryImpl
  implements ActivityLogRepository<EntityManager>
{
  private readonly logger = new Logger(ActivityLogRepositoryImpl.name);

  constructor(private readonly dataSource: DataSource) {}

  async create(log: ActivityLog, manager: EntityManager): Promise<ActivityLog> {
    // Validate that details is valid JSON before storing
    let detailsJson: string | null = null;
    if (log.details) {
      try {
        // Parse to validate JSON, then use original string for storage
        // This ensures we're storing valid JSON while preserving the exact format
        JSON.parse(log.details);
        detailsJson = log.details;
      } catch (error) {
        this.logger.warn(
          `Invalid JSON in activity log details, storing as escaped string: ${error.message}`,
        );
        // If invalid JSON, wrap it in an object to preserve the data
        detailsJson = JSON.stringify({ raw: log.details });
      }
    }

    // Use raw SQL query for insert
    const query = `
      INSERT INTO activitylogs (action, entity, details, occurred_at, user_name)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await manager.query(query, [
      log.action,
      log.entity,
      detailsJson,
      log.occurred_at || new Date(),
      log.user_name || null,
    ]);

    const row = getFirstRow(result);
    if (!row) {
      return null;
    }
    return this.rowToModel(row);
  }

  async findAll(): Promise<ActivityLog[]> {
    const query = `
      SELECT 
        id,
        action,
        entity,
        details,
        occurred_at,
        user_name
      FROM activitylogs
      ORDER BY occurred_at DESC
    `;

    const result = await this.dataSource.query(query);
    const rows = extractRows(result);
    return rows.map((row) => this.rowToModel(row));
  }

  async findByEntity(entity: string): Promise<ActivityLog[]> {
    const query = `
      SELECT 
        id,
        action,
        entity,
        details,
        occurred_at,
        user_name
      FROM activitylogs
      WHERE entity = $1
      ORDER BY occurred_at DESC
    `;

    const result = await this.dataSource.query(query, [entity]);
    const rows = extractRows(result);
    return rows.map((row) => this.rowToModel(row));
  }

  async findByAction(action: string): Promise<ActivityLog[]> {
    const query = `
      SELECT 
        id,
        action,
        entity,
        details,
        occurred_at,
        user_name
      FROM activitylogs
      WHERE action = $1
      ORDER BY occurred_at DESC
    `;

    const result = await this.dataSource.query(query, [action]);
    const rows = extractRows(result);
    return rows.map((row) => this.rowToModel(row));
  }

  /**
   * Converts raw database row to domain model
   * Handles conversion from database result (JSON) to domain model
   * Works with both MySQL and PostgreSQL JSON columns
   */
  private rowToModel(row: any): ActivityLog {
    // Handle JSON details - database drivers may return JSON as string or parsed object
    let detailsString = '';
    if (row.details !== null && row.details !== undefined) {
      if (typeof row.details === 'string') {
        // Already a string (MySQL or PostgreSQL returning as text)
        detailsString = row.details;
      } else if (typeof row.details === 'object') {
        // Parsed object (PostgreSQL driver auto-parsing JSONB/JSON)
        detailsString = JSON.stringify(row.details);
      } else {
        // Fallback for unexpected types
        detailsString = String(row.details);
      }
    }

    const log = new ActivityLog({
      id: row.id,
      action: row.action,
      entity: row.entity,
      details: detailsString,
      occurred_at: row.occurred_at,
      user_name: row.user_name,
    });

    return log;
  }
}
