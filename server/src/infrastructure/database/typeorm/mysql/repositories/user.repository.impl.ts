import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '@domain/models/user.model';
import { UserRepository } from '@domains/repositories/user.repository';

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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await manager.query(query, [
        user.precinct,
        user.watcher,
        user.applicationAccess,
        user.userRoles,
        user.userName,
        user.password,
        user.createdBy || null,
        user.createdAt || new Date(),
      ]);

      // Get the inserted row
      const insertId = result.insertId;
      const selectQuery = `
        SELECT 
          id,
          precinct,
          watcher,
          application_access as applicationAccess,
          user_roles as userRoles,
          user_name as userName,
          password,
          deleted_by as deletedBy,
          deleted_at as deletedAt,
          created_by as createdBy,
          created_at as createdAt,
          updated_by as updatedBy,
          updated_at as updatedAt
        FROM users
        WHERE id = ?
      `;

      const rows = await manager.query(selectQuery, [insertId]);
      return this.rowToModel(rows[0]);
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

      if (updateFields.precinct !== undefined) {
        updateParts.push('precinct = ?');
        values.push(updateFields.precinct);
      }

      if (updateFields.watcher !== undefined) {
        updateParts.push('watcher = ?');
        values.push(updateFields.watcher);
      }

      if (updateFields.applicationAccess !== undefined) {
        updateParts.push('application_access = ?');
        values.push(updateFields.applicationAccess);
      }

      if (updateFields.userRoles !== undefined) {
        updateParts.push('user_roles = ?');
        values.push(updateFields.userRoles);
      }

      if (updateFields.userName !== undefined) {
        updateParts.push('user_name = ?');
        values.push(updateFields.userName);
      }

      if (updateFields.password !== undefined) {
        updateParts.push('password = ?');
        values.push(updateFields.password);
      }

      if (updateFields.updatedBy !== undefined) {
        updateParts.push('updated_by = ?');
        values.push(updateFields.updatedBy);
      }

      if (updateFields.updatedAt !== undefined) {
        updateParts.push('updated_at = ?');
        values.push(updateFields.updatedAt);
      }

      if (updateParts.length === 0) {
        return false;
      }

      values.push(id);

      const query = `
        UPDATE users
        SET ${updateParts.join(', ')}
        WHERE id = ? AND deleted_at IS NULL
      `;

      const result = await manager.query(query, values);
      return result.affectedRows && result.affectedRows > 0;
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
      whereConditions.push('deleted_at IS NOT NULL');
    } else {
      whereConditions.push('deleted_at IS NULL');
    }

    // Apply search filter on watcher
    if (term) {
      whereConditions.push('LOWER(watcher) LIKE ?');
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build data query
    const dataQuery = `
      SELECT 
        id,
        precinct,
        watcher,
        application_access as applicationAccess,
        user_roles as userRoles,
        user_name as userName,
        deleted_at as deletedAt
      FROM users
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS totalRecords
      FROM users
      ${whereClause}
    `;

    // Execute both queries simultaneously
    const [dataRows, countResult] = await Promise.all([
      this.dataSource.query(dataQuery, [...queryParams, limit, skip]),
      this.dataSource.query(countQuery, queryParams),
    ]);

    // Extract total records
    const totalRecords = parseInt(countResult[0]?.totalRecords || '0', 10);

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
        application_access as applicationAccess,
        user_roles as userRoles,
        user_name as userName,
        password,
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM users
      WHERE id = ? AND deleted_at IS NULL
    `;

    const rows = await manager.query(query, [id]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0], true);
  }

  async findByUserName(userName: string): Promise<User | null> {
    const query = `
      SELECT 
        id,
        precinct,
        watcher,
        application_access as applicationAccess,
        user_roles as userRoles,
        user_name as userName,
        password
      FROM users
      WHERE user_name = ?
      LIMIT 1
    `;

    const rows = await this.dataSource.query(query, [userName]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0], true);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any, includePassword: boolean = false): User {
    return new User({
      id: row.id,
      precinct: row.precinct,
      watcher: row.watcher,
      applicationAccess: row.applicationAccess,
      userRoles: row.userRoles,
      userName: row.userName,
      password: includePassword ? row.password : undefined,
      deletedBy: row.deletedBy,
      deletedAt: row.deletedAt,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedBy: row.updatedBy,
      updatedAt: row.updatedAt,
    });
  }
}
