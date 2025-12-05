import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '@domain/models/user.model';
import { UserRepository } from '@domains/repositories/user.repository';
import {
  getInsertId,
  getFirstRow,
  hasAffectedRows,
  extractRows,
} from '@shared/utils/query-result.util';

@Injectable()
export class UserRepositoryImpl implements UserRepository<EntityManager> {
  constructor(private readonly dataSource: DataSource) {}

  async create(user: User, manager: EntityManager): Promise<User> {
    try {
      const query = `
        INSERT INTO users (
          precinct,
          watcher,
          applicationaccess,
          userroles,
          username,
          password,
          createdby,
          createdat
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, precinct, watcher, applicationaccess, userroles, username, createdby, createdat
      `;

      const result = await manager.query(query, [
        user.precinct,
        user.watcher,
        JSON.stringify(user.applicationAccess || []),
        JSON.stringify(user.userRoles || []),
        user.userName,
        user.password,
        user.createdBy || null,
        user.createdAt || new Date(),
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
    updateFields: Partial<User>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const updateParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateFields.precinct !== undefined) {
        updateParts.push(`precinct = $${paramIndex++}`);
        values.push(updateFields.precinct);
      }

      if (updateFields.watcher !== undefined) {
        updateParts.push(`watcher = $${paramIndex++}`);
        values.push(updateFields.watcher);
      }

      if (updateFields.applicationAccess !== undefined) {
        updateParts.push(`applicationaccess = $${paramIndex++}`);
        values.push(JSON.stringify(updateFields.applicationAccess || []));
      }

      if (updateFields.userRoles !== undefined) {
        updateParts.push(`userroles = $${paramIndex++}`);
        values.push(JSON.stringify(updateFields.userRoles || []));
      }

      if (updateFields.userName !== undefined) {
        updateParts.push(`username = $${paramIndex++}`);
        values.push(updateFields.userName);
      }

      if (updateFields.password !== undefined) {
        updateParts.push(`password = $${paramIndex++}`);
        values.push(updateFields.password);
      }

      if (updateFields.updatedBy !== undefined) {
        updateParts.push(`updatedby = $${paramIndex++}`);
        values.push(updateFields.updatedBy);
      }

      if (updateFields.updatedAt !== undefined) {
        updateParts.push(`updatedat = $${paramIndex++}`);
        values.push(updateFields.updatedAt);
      }

      if (updateParts.length === 0) {
        return false;
      }

      values.push(id);

      const query = `
        UPDATE users
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex} AND deletedat IS NULL
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
    isDeleted: boolean,
  ): Promise<{
    data: User[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    const skip = (page - 1) * limit;

    // Build WHERE clause
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    // Filter by deletion status
    if (isDeleted) {
      whereConditions.push('deletedat IS NOT NULL');
    } else {
      whereConditions.push('deletedat IS NULL');
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
        applicationaccess as applicationaccess,
        userroles as userroles,
        username as username,
        deletedat as deletedat
      FROM users
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS totalRecords
      FROM users
      ${whereClause}
    `;

    // Execute both queries simultaneously
    const [dataResult, countResult] = await Promise.all([
      this.dataSource.query(dataQuery, [...queryParams, limit, skip]),
      this.dataSource.query(countQuery, queryParams),
    ]);

    // Extract rows and total records
    const dataRows = extractRows(dataResult);
    const countRow = getFirstRow(countResult);
    const totalRecords = parseInt(countRow?.totalRecords || '0', 10);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRecords / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

    // Map raw results to domain models (without password)
    const data = dataRows.map((row: any) => this.rowToModel(row, false));

    return {
      data,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages,
        nextPage,
        previousPage,
      },
    };
  }

  async findById(id: number, manager: EntityManager): Promise<User | null> {
    const query = `
      SELECT 
        id,
        precinct,
        watcher,
        applicationaccess as applicationaccess,
        userroles as userroles,
        username as username,
        password,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM users
      WHERE id = $1 AND deletedat IS NULL
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
          applicationaccess as applicationaccess,
          userroles as userroles,
          username as username,
          password
        FROM users
        WHERE username = $1
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
    let applicationAccess: string[] = [];
    if (row.applicationaccess) {
      if (typeof row.applicationaccess === 'string') {
        try {
          // Try parsing as JSON first (for JSON columns)
          applicationAccess = JSON.parse(row.applicationaccess);
        } catch {
          // Fallback to comma-separated string (for legacy data)
          applicationAccess = row.applicationaccess
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0);
        }
      } else if (Array.isArray(row.applicationaccess)) {
        // Already an array (from JSON column that was auto-parsed)
        applicationAccess = row.applicationaccess;
      }
    }

    let userRoles: string[] = [];
    if (row.userroles) {
      if (typeof row.userroles === 'string') {
        try {
          // Try parsing as JSON first (for JSON columns)
          userRoles = JSON.parse(row.userroles);
        } catch {
          // Fallback to comma-separated string (for legacy data)
          userRoles = row.userroles
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0);
        }
      } else if (Array.isArray(row.userroles)) {
        // Already an array (from JSON column that was auto-parsed)
        userRoles = row.userroles;
      }
    }

    return new User({
      id: row.id,
      precinct: row.precinct,
      watcher: row.watcher,
      applicationAccess,
      userRoles,
      userName: row.username,
      password: includePassword ? row.password : undefined,
      deletedBy: row.deletedby,
      deletedAt: row.deletedat,
      createdBy: row.createdby,
      createdAt: row.createdat,
      updatedBy: row.updatedby,
      updatedAt: row.updatedat,
    });
  }
}
