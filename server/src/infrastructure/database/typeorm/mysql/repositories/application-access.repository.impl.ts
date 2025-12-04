import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ApplicationAccess } from '@domain/models/application-access.model';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';

@Injectable()
export class ApplicationAccessRepositoryImpl
  implements ApplicationAccessRepository<EntityManager>
{
  constructor(private readonly dataSource: DataSource) {}

  async create(
    applicationAccess: ApplicationAccess,
    manager: EntityManager,
  ): Promise<ApplicationAccess> {
    try {
      const query = `
        INSERT INTO applicationaccess (desc1, created_by, created_at)
        VALUES (?, ?, ?)
      `;

      const result = await manager.query(query, [
        applicationAccess.desc1,
        applicationAccess.createdBy || null,
        applicationAccess.createdAt || new Date(),
      ]);

      // Get the inserted row
      const insertId = result.insertId;
      const selectQuery = `
        SELECT 
          id,
          desc1,
          deleted_by as deletedBy,
          deleted_at as deletedAt,
          created_by as createdBy,
          created_at as createdAt,
          updated_by as updatedBy,
          updated_at as updatedAt
        FROM applicationaccess
        WHERE id = ?
      `;

      const savedRow = await manager.query(selectQuery, [insertId]);
      return this.rowToModel(savedRow[0]);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Application access already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<ApplicationAccess>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const updateParts: string[] = [];
      const values: any[] = [];

      if (updateFields.desc1 !== undefined) {
        updateParts.push('desc1 = ?');
        values.push(updateFields.desc1);
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
        UPDATE applicationaccess
        SET ${updateParts.join(', ')}
        WHERE id = ?
      `;

      const result = await manager.query(query, values);
      return result.affectedRows && result.affectedRows > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Application access already exists');
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
    data: ApplicationAccess[];
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

    // Apply search filter on description
    if (term) {
      whereConditions.push('LOWER(desc1) LIKE ?');
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // Build data query
    const dataQuery = `
      SELECT 
        id,
        desc1,
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM applicationaccess
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS totalRecords
      FROM applicationaccess
      ${whereClause}
    `;

    // Execute both queries simultaneously
    const [dataRows, countResult] = await Promise.all([
      this.dataSource.query(dataQuery, [...queryParams, limit, skip]),
      this.dataSource.query(countQuery, queryParams),
    ]);

    // Extract total records
    const totalRecords = parseInt(countResult[0]?.totalRecords || '0', 10);

    // Map raw results to domain models
    const data = dataRows.map((row: any) => this.rowToModel(row));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRecords / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

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

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<ApplicationAccess | null> {
    const query = `
      SELECT 
        id,
        desc1,
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM applicationaccess
      WHERE id = ? AND deleted_at IS NULL
    `;

    const rows = await manager.query(query, [id]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  async combobox(): Promise<ApplicationAccess[]> {
    const query = `
      SELECT 
        id,
        desc1,
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM applicationaccess
      WHERE deleted_at IS NULL
      ORDER BY desc1 ASC
    `;

    const rows = await this.dataSource.query(query);
    return rows.map((row: any) => this.rowToModel(row));
  }

  async findByDesc(desc1: string): Promise<ApplicationAccess> {
    const query = `
      SELECT 
        id,
        desc1,
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM applicationaccess
      WHERE desc1 = ? AND deleted_at IS NULL
      LIMIT 1
    `;

    const rows = await this.dataSource.query(query, [desc1]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): ApplicationAccess {
    return new ApplicationAccess({
      id: row.id,
      desc1: row.desc1,
      deletedBy: row.deletedBy,
      deletedAt: row.deletedAt,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedBy: row.updatedBy,
      updatedAt: row.updatedAt,
    });
  }
}
