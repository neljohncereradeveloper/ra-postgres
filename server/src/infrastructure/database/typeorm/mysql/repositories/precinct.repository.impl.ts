import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { calculatePagination } from '@shared/utils/pagination.util';
import { PrecinctRepository } from '@domains/repositories/precinct.repository';
import { Precinct } from '@domain/models/precinct.model';
import {
  getFirstRow,
  hasAffectedRows,
  extractRows,
} from '@shared/utils/query-result.util';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

@Injectable()
export class PrecinctRepositoryImpl
  implements PrecinctRepository<EntityManager>
{
  constructor(private readonly dataSource: DataSource) {}
  async create(precinct: Precinct, manager: EntityManager): Promise<Precinct> {
    try {
      const query = `
        INSERT INTO precincts (desc1, created_by, created_at)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const result = await manager.query(query, [
        precinct.desc1,
        precinct.created_by || null,
        precinct.created_at || new Date(),
      ]);

      const row = getFirstRow(result);
      if (!row) {
        return null;
      }
      return this.rowToModel(row);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Precinct name already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    update_fields: Partial<Precinct>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const updateParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (update_fields.desc1 !== undefined) {
        updateParts.push(`desc1 = $${paramIndex++}`);
        values.push(update_fields.desc1);
      }

      if (update_fields.deleted_at !== undefined) {
        updateParts.push(`deleted_at = $${paramIndex++}`);
        values.push(update_fields.deleted_at);
      }

      if (update_fields.deleted_by !== undefined) {
        updateParts.push(`deleted_by = $${paramIndex++}`);
        values.push(update_fields.deleted_by);
      }

      if (update_fields.updated_by !== undefined) {
        updateParts.push(`updated_by = $${paramIndex++}`);
        values.push(update_fields.updated_by);
      }

      if (update_fields.updated_at !== undefined) {
        updateParts.push(`updated_at = $${paramIndex++}`);
        values.push(update_fields.updated_at);
      }

      if (updateParts.length === 0) {
        return false;
      }

      // Always update updatedat if not explicitly set
      if (update_fields.updated_at === undefined) {
        updateParts.push(`updated_at = $${paramIndex++}`);
        values.push(new Date());
      }

      values.push(id);

      const query = `
        UPDATE precincts
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex}
      `;

      const result = await manager.query(query, values);
      return hasAffectedRows(result);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Precinct name already exists');
      }
      throw error;
    }
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<PaginatedResult<Precinct>> {
    const skip = (page - 1) * limit;

    // Build WHERE clause
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    if (is_archived) {
      whereConditions.push('deleted_at IS NOT NULL');
    } else {
      whereConditions.push('deleted_at IS NULL');
    }

    // Add search term if provided
    let paramIndex = 1;
    if (term) {
      whereConditions.push(`LOWER(desc1) LIKE $${paramIndex++}`);
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Data query
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
      FROM precincts
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(id) AS "total_records"
      FROM precincts
      ${whereClause}
    `;

    // Execute both queries using DataSource
    const [data_rows, count_result] = await Promise.all([
      this.dataSource.query(dataQuery, [...queryParams, limit, skip]),
      this.dataSource.query(countQuery, queryParams),
    ]);

    const data_rows_array = extractRows(data_rows);
    const count_row = getFirstRow(count_result);
    const data = data_rows_array.map((row: any) => this.rowToModel(row));
    const total_records = parseInt(count_row?.total_records || '0', 10);
    const { total_pages, next_page, previous_page } = calculatePagination(
      total_records,
      page,
      limit,
    );

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

  async findById(id: number, manager: EntityManager): Promise<Precinct | null> {
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
      FROM precincts
      WHERE id = $1
    `;

    const result = await manager.query(query, [id]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async findByDescription(
    desc1: string,
    manager: EntityManager,
  ): Promise<Precinct | null> {
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
      FROM precincts
      WHERE desc1 = $1 AND deleted_at IS NULL
      LIMIT 1
    `;

    const result = await manager.query(query, [desc1]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async combobox(): Promise<Precinct[]> {
    const query = `
      SELECT 
        id,
        desc1
      FROM precincts
      WHERE deleted_at IS NULL
      ORDER BY desc1 ASC
    `;

    const rows = await this.dataSource.query(query);
    return rows.map((row) => this.rowToModel(row));
  }

  // Helper: Convert database row to domain model
  private rowToModel(row: any): Precinct {
    return new Precinct({
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
