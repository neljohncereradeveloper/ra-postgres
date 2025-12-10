import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ApplicationAccess } from '@domain/models/application-access.model';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
import {
  getFirstRow,
  hasAffectedRows,
  extractRows,
} from '@shared/utils/query-result.util';

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
        VALUES ($1, $2, $3)
        RETURNING * 
      `;

      const result = await manager.query(query, [
        applicationAccess.desc1,
        applicationAccess.created_by || null,
        applicationAccess.created_at || new Date(),
      ]);

      const row = getFirstRow(result);
      if (!row) {
        return null;
      }
      return this.rowToModel(row);
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
      let paramIndex = 1;

      if (updateFields.desc1 !== undefined) {
        updateParts.push(`desc1 = $${paramIndex++}`);
        values.push(updateFields.desc1);
      }

      if (updateFields.updated_by !== undefined) {
        updateParts.push(`updated_by = $${paramIndex++}`);
        values.push(updateFields.updated_by);
      }

      if (updateFields.updated_at !== undefined) {
        updateParts.push(`updated_at = $${paramIndex++}`);
        values.push(updateFields.updated_at);
      }

      if (updateParts.length === 0) {
        return false;
      }

      values.push(id);

      const query = `
        UPDATE applicationaccess
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex}
      `;

      const result = await manager.query(query, values);
      return hasAffectedRows(result);
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
    is_archived: boolean,
  ): Promise<{
    data: ApplicationAccess[];
    meta: {
      page: number;
      limit: number;
      total_records: number;
      total_pages: number;
      next_page: number | null;
      previous_page: number | null;
    };
  }> {
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

    // Apply search filter on description
    let paramIndex = 1;
    if (term) {
      whereConditions.push(`LOWER(desc1) LIKE $${paramIndex++}`);
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
        deleted_by,
        deleted_at,
        created_by,
        created_at,
        updated_by,
        updated_at
      FROM applicationaccess
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS "totalRecords"
      FROM applicationaccess
      ${whereClause}
    `;

    // Execute both queries simultaneously
    const [data_rows, count_result] = await Promise.all([
      this.dataSource.query(dataQuery, [...queryParams, limit, skip]),
      this.dataSource.query(countQuery, queryParams),
    ]);

    // Extract total records
    const data_rows_array = extractRows(data_rows);
    const count_row = getFirstRow(count_result);
    const total_records = parseInt(count_row?.total_records || '0', 10);

    // Map raw results to domain models
    const data = data_rows_array.map((row: any) => this.rowToModel(row));

    // Calculate pagination metadata
    const total_pages = Math.ceil(total_records / limit);
    const next_page = page < total_pages ? page + 1 : null;
    const previous_page = page > 1 ? page - 1 : null;

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

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<ApplicationAccess | null> {
    const query = `
      SELECT 
        id,
        desc1,
        deleted_by,
        deleted_at,
        created_by,
        created_at,
        updated_by,
        updated_at
      FROM applicationaccess
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await manager.query(query, [id]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async combobox(): Promise<ApplicationAccess[]> {
    const query = `
      SELECT 
        id,
        desc1
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
        deleted_by,
        deleted_at,
        created_by,
        created_at,
        updated_by,
        updated_at
      FROM applicationaccess
      WHERE desc1 = $1 AND deleted_at IS NULL
      LIMIT 1
    `;

    const result = await this.dataSource.query(query, [desc1]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): ApplicationAccess {
    return new ApplicationAccess({
      id: row.id,
      desc1: row.desc1,
      deleted_by: row.deleted_by,
      deleted_at: row.deleted_at,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_by: row.updated_by,
      updated_at: row.updated_at,
    });
  }
}
