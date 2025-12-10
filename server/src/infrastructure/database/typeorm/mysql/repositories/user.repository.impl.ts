import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '@domain/models/user.model';
import { UserRepository } from '@domains/repositories/user.repository';
import {
  getFirstRow,
  hasAffectedRows,
  extractRows,
} from '@shared/utils/query-result.util';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

@Injectable()
export class UserRepositoryImpl implements UserRepository<EntityManager> {
  constructor(private readonly dataSource: DataSource) {}

  async create(user: User, manager: EntityManager): Promise<User> {
    try {
      const query = `
        INSERT INTO users (
          precinct,
          watcher,
          application_access,
          user_roles,
          user_name,
          password,
          created_by,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, precinct, watcher, application_access, user_roles, user_name, created_by, created_at
      `;

      const result = await manager.query(query, [
        user.precinct,
        user.watcher,
        JSON.stringify(user.application_access || []),
        JSON.stringify(user.user_roles || []),
        user.user_name,
        user.password,
        user.created_by || null,
        user.created_at || new Date(),
      ]);

      const row = getFirstRow(result);
      if (!row) {
        return null;
      }
      return this.rowToModel(row, true);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    update_fields: Partial<User>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const updateParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (update_fields.precinct !== undefined) {
        updateParts.push(`precinct = $${paramIndex++}`);
        values.push(update_fields.precinct);
      }

      if (update_fields.watcher !== undefined) {
        updateParts.push(`watcher = $${paramIndex++}`);
        values.push(update_fields.watcher);
      }

      if (update_fields.application_access !== undefined) {
        updateParts.push(`application_access = $${paramIndex++}`);
        values.push(JSON.stringify(update_fields.application_access || []));
      }

      if (update_fields.user_roles !== undefined) {
        updateParts.push(`user_roles = $${paramIndex++}`);
        values.push(JSON.stringify(update_fields.user_roles || []));
      }

      if (update_fields.user_name !== undefined) {
        updateParts.push(`user_name = $${paramIndex++}`);
        values.push(update_fields.user_name);
      }

      if (update_fields.password !== undefined) {
        updateParts.push(`password = $${paramIndex++}`);
        values.push(update_fields.password);
      }

      if (update_fields.updated_by !== undefined) {
        updateParts.push(`updated_by = $${paramIndex++}`);
        values.push(update_fields.updated_by);
      }

      if (update_fields.updated_at !== undefined) {
        updateParts.push(`updated_at = $${paramIndex++}`);
        values.push(update_fields.updated_at);
      }

      if (update_fields.deleted_at !== undefined) {
        updateParts.push(`deleted_at = $${paramIndex++}`);
        values.push(update_fields.deleted_at);
      }

      if (update_fields.deleted_by !== undefined) {
        updateParts.push(`deleted_by = $${paramIndex++}`);
        values.push(update_fields.deleted_by);
      }

      if (updateParts.length === 0) {
        return false;
      }

      values.push(id);

      const query = `
        UPDATE users
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex}
      `;

      const result = await manager.query(query, values);
      return hasAffectedRows(result);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<PaginatedResult<User>> {
    const skip = (page - 1) * limit;

    // Build WHERE clause
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    // Filter by deletion status
    if (is_archived) {
      whereConditions.push('deleted_at IS NOT NULL');
    } else {
      whereConditions.push('deleted_at IS NULL');
    }

    // Apply search filter on watcher
    let paramIndex = 1;
    if (term) {
      whereConditions.push(`LOWER(watcher) LIKE $${paramIndex++}`);
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build data query
    const dataQuery = `
      SELECT 
        id,
        precinct,
        watcher,
        application_access,
        user_roles,
        user_name,
        deleted_at,
      FROM users
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS "totalRecords"
      FROM users
      ${whereClause}
    `;

    // Execute both queries simultaneously
    const [data_rows, count_result] = await Promise.all([
      this.dataSource.query(dataQuery, [...queryParams, limit, skip]),
      this.dataSource.query(countQuery, queryParams),
    ]);

    // Extract rows and total records
    const data_rows_array = extractRows(data_rows);
    const count_row = getFirstRow(count_result);
    const total_records = parseInt(count_row?.total_records || '0', 10);

    // Calculate pagination metadata
    const total_pages = Math.ceil(total_records / limit);
    const next_page = page < total_pages ? page + 1 : null;
    const previous_page = page > 1 ? page - 1 : null;

    // Map raw results to domain models (without password)
    const data = data_rows_array.map((row: any) => this.rowToModel(row, false));

    return {
      data,
      meta: {
        page,
        limit,
        total_records,
        total_pages,
        next_page,
        previous_page,
      },
    };
  }

  async findById(id: number, manager: EntityManager): Promise<User | null> {
    const query = `
      SELECT 
        id,
        precinct,
        watcher,
        application_access,
        user_roles,
        user_name,
        password,
        deleted_by,
        deleted_at,
        created_by,
        created_at,
        updated_by,
        updated_at,
      FROM users
      WHERE id = $1
    `;

    const result = await manager.query(query, [id]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row, true);
  }

  async findByUserName(userName: string): Promise<User | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      const query = `
        SELECT 
          id,
          precinct,
          watcher,
          application_access,
          user_roles,
          user_name,
          password
        FROM users
        WHERE user_name = $1
        LIMIT 1
      `;

      const result = await queryRunner.query(query, [userName]);
      const row = getFirstRow(result);
      if (!row) {
        return null;
      }

      return this.rowToModel(row, true);
    } finally {
      await queryRunner.release();
    }
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any, includePassword: boolean = false): User {
    // Parse JSON strings to arrays, or handle already-parsed arrays
    let application_access: string[] = [];
    if (row.application_access) {
      if (typeof row.application_access === 'string') {
        try {
          // Try parsing as JSON first (for JSON columns)
          application_access = JSON.parse(row.application_access);
        } catch {
          // Fallback to comma-separated string (for legacy data)
          application_access = row.application_access
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0);
        }
      } else if (Array.isArray(row.application_access)) {
        // Already an array (from JSON column that was auto-parsed)
        application_access = row.application_access;
      }
    }

    let user_roles: string[] = [];
    if (row.user_roles) {
      if (typeof row.user_roles === 'string') {
        try {
          // Try parsing as JSON first (for JSON columns)
          user_roles = JSON.parse(row.user_roles);
        } catch {
          // Fallback to comma-separated string (for legacy data)
          user_roles = row.user_roles
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0);
        }
      } else if (Array.isArray(row.user_roles)) {
        // Already an array (from JSON column that was auto-parsed)
        user_roles = row.user_roles;
      }
    }

    return new User({
      id: row.id,
      precinct: row.precinct,
      watcher: row.watcher,
      application_access: application_access,
      user_roles: user_roles,
      user_name: row.user_name,
      password: includePassword ? row.password : undefined,
      deleted_by: row.deleted_by,
      deleted_at: row.deleted_at,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_by: row.updated_by,
      updated_at: row.updated_at,
    });
  }
}
