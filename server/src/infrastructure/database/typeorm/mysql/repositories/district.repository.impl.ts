import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { District } from '@domain/models/district.model';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { calculatePagination } from '@shared/utils/pagination.util';
import {
  getFirstRow,
  hasAffectedRows,
  extractRows,
} from '@shared/utils/query-result.util';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

@Injectable()
export class DistrictRepositoryImpl
  implements DistrictRepository<EntityManager>
{
  constructor() {}

  async create(district: District, manager: EntityManager): Promise<District> {
    try {
      const query = `
        INSERT INTO districts (
          election_id,
          desc1,
          created_by,
          created_at
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const result = await manager.query(query, [
        district.election_id,
        district.desc1,
        district.created_by || null,
        district.created_at || new Date(),
      ]);

      const row = getFirstRow(result);
      if (!row) {
        return null;
      }
      return this.rowToModel(row);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('District name already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    update_fields: Partial<District>,
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
        UPDATE districts
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex}
      `;

      const result = await manager.query(query, values);
      return hasAffectedRows(result);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('District name already exists');
      }
      throw error;
    }
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    election_id: number,
    manager: EntityManager,
  ): Promise<PaginatedResult<District>> {
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

    // Filter by election
    let paramIndex = 1;
    whereConditions.push(`election_id = $${paramIndex++}`);
    queryParams.push(election_id);

    // Apply search filter on description
    if (term) {
      whereConditions.push(`LOWER(desc1) LIKE $${paramIndex++}`);
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build data query
    const dataQuery = `
      SELECT 
        id,
        election_id,
        desc1,
        deleted_by,
        deleted_at,
        created_by,
        created_at,
        updated_by,
        updated_at
      FROM districts
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS "total_records"
      FROM districts
      ${whereClause}
    `;

    // Execute both queries simultaneously
    const [data_rows, count_result] = await Promise.all([
      manager.query(dataQuery, [...queryParams, limit, skip]),
      manager.query(countQuery, queryParams),
    ]);

    // Extract total records
    const data_rows_array = extractRows(data_rows);
    const count_row = getFirstRow(count_result);
    const total_records = parseInt(count_row?.total_records || '0', 10);
    const { total_pages, next_page, previous_page } = calculatePagination(
      total_records,
      page,
      limit,
    );

    // Map raw results to domain models
    const data = data_rows_array.map((row: any) => this.rowToModel(row));

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

  async findById(id: number, manager: EntityManager): Promise<District | null> {
    const query = `
      SELECT 
        id,
        election_id,
        desc1,
        deleted_by,
        deleted_at,
        created_by,
        created_at,
        updated_by,
        updated_at
      FROM districts
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
    election_id: number,
    manager: EntityManager,
  ): Promise<District | null> {
    const query = `
      SELECT 
        id,
        election_id,
        desc1,
        deleted_by,
        deleted_at,
        created_by,
        created_at,
        updated_by,
        updated_at
      FROM districts
      WHERE desc1 = $1 AND election_id = $2 AND deleted_at IS NULL
      LIMIT 1
    `;

    const result = await manager.query(query, [desc1, election_id]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async combobox(
    election_id: number,
    manager: EntityManager,
  ): Promise<District[]> {
    const query = `
      SELECT 
        id,
        desc1
      FROM districts
      WHERE election_id = $1 AND deleted_at IS NULL
      ORDER BY desc1 ASC
    `;

    const result = await manager.query(query, [election_id]);
    const rows = extractRows(result);
    return rows.map((row: any) => this.rowToModel(row));
  }

  async countByElection(
    election_id: number,
    manager: EntityManager,
  ): Promise<number> {
    const query = `
      SELECT COUNT(id) AS "count"
      FROM districts
      WHERE deleted_at IS NULL AND election_id = $1
    `;

    const result = await manager.query(query, [election_id]);
    const row = getFirstRow(result);
    return parseInt(row?.count || '0', 10);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): District {
    return new District({
      id: row.id,
      election_id: row.election_id,
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
