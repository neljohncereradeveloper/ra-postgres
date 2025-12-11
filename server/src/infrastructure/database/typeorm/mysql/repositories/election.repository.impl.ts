import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { calculatePagination } from '@shared/utils/pagination.util';
import { Election } from '@domain/models/election.model';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { ElectionStatus } from '@domain/enums/index';
import {
  getFirstRow,
  hasAffectedRows,
  extractRows,
} from '@shared/utils/query-result.util';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';
import { getPHDateString } from '@domain/utils/format-ph-time';

@Injectable()
export class ElectionRepositoryImpl
  implements ElectionRepository<EntityManager>
{
  constructor(private readonly dataSource: DataSource) {}

  async create(election: Election, manager: EntityManager): Promise<Election> {
    try {
      const query = `
        INSERT INTO elections (
          name,
          desc1,
          address,
          date,
          start_time,
          end_time,
          max_attendees,
          election_status,
          created_by,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const result = await manager.query(query, [
        election.name,
        election.desc1 || null,
        election.address,
        election.date || null,
        election.start_time || null,
        election.end_time || null,
        election.max_attendees || null,
        election.election_status || ElectionStatus.SCHEDULED,
        election.created_by || null,
        election.created_at || new Date(),
      ]);

      const row = getFirstRow(result);
      if (!row) {
        return null;
      }
      return this.rowToModel(row);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Election name already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    update_fields: Partial<Election>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const updateParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (update_fields.name !== undefined) {
        updateParts.push(`name = $${paramIndex++}`);
        values.push(update_fields.name);
      }

      if (update_fields.desc1 !== undefined) {
        updateParts.push(`desc1 = $${paramIndex++}`);
        values.push(update_fields.desc1);
      }

      if (update_fields.address !== undefined) {
        updateParts.push(`address = $${paramIndex++}`);
        values.push(update_fields.address);
      }

      if (update_fields.date !== undefined) {
        updateParts.push(`date = $${paramIndex++}`);
        values.push(update_fields.date);
      }

      if (update_fields.start_time !== undefined) {
        updateParts.push(`start_time = $${paramIndex++}`);
        values.push(update_fields.start_time);
      }

      if (update_fields.end_time !== undefined) {
        updateParts.push(`end_time = $${paramIndex++}`);
        values.push(update_fields.end_time);
      }

      if (update_fields.max_attendees !== undefined) {
        updateParts.push(`max_attendees = $${paramIndex++}`);
        values.push(update_fields.max_attendees);
      }

      if (update_fields.election_status !== undefined) {
        updateParts.push(`election_status = $${paramIndex++}`);
        values.push(update_fields.election_status);
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
        UPDATE elections
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex}
      `;

      const result = await manager.query(query, values);
      return hasAffectedRows(result);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Election name already exists');
      }
      throw error;
    }
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<PaginatedResult<Election>> {
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

    // Apply search filter on name
    let paramIndex = 1;
    if (term) {
      whereConditions.push(`LOWER(name) LIKE $${paramIndex++}`);
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build data query
    const dataQuery = `
      SELECT 
        id,
        name,
        desc1,
        address,
        date::text,
        start_time,
        end_time,
        max_attendees,
        election_status,
        deleted_at
      FROM elections
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS "total_records"
      FROM elections
      ${whereClause}
    `;

    // Execute both queries simultaneously
    const [data_rows, count_result] = await Promise.all([
      this.dataSource.query(dataQuery, [...queryParams, limit, skip]),
      this.dataSource.query(countQuery, queryParams),
    ]);

    console.log('data_rows => ', data_rows);

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

  async findById(
    id: number,
    manager?: EntityManager,
  ): Promise<Election | null> {
    if (!manager) {
      return null;
    }

    const query = `
      SELECT 
        id,
        name,
        desc1,
        address,
        date::text,
        start_time,
        end_time,
        max_attendees,
        election_status,
        deleted_by,
        deleted_at,
        created_by,
        created_at,
        updated_by,
        updated_at
      FROM elections
      WHERE id = $1
    `;

    const result = await manager.query(query, [id]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async combobox(): Promise<Election[]> {
    const query = `
      SELECT 
        id,
        name,
        desc1,
        address,
        date::text,
        start_time,
        end_time,
        max_attendees,
        election_status
      FROM elections
      WHERE deleted_at IS NULL
      ORDER BY name ASC
    `;

    const rows = await this.dataSource.query(query);
    return rows.map((row: any) => this.rowToModel(row));
  }

  async comboboxRetrieveScheduledElections(): Promise<Election[]> {
    const query = `
      SELECT 
        id,
        name,
        desc1,
        address,
        date::text
      FROM elections
      WHERE deleted_at IS NULL AND election_status = $1
      ORDER BY name ASC
    `;

    const result = await this.dataSource.query(query, [
      ElectionStatus.SCHEDULED,
    ]);
    const rows = extractRows(result);
    return rows.map((row: any) => this.rowToModel(row));
  }

  async findByName(
    name: string,
    manager: EntityManager,
  ): Promise<Election | null> {
    const query = `
      SELECT 
        id,
        name,
        desc1,
        address,
        date::text,
        start_time,
        end_time,
        max_attendees,
        election_status,
        deleted_by,
        deleted_at,
        created_by,
        created_at,
        updated_by,
        updated_at
      FROM elections
      WHERE name = $1 AND deleted_at IS NULL
      LIMIT 1
    `;

    const result = await manager.query(query, [name]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): Election {
    return new Election({
      id: row.id,
      name: row.name,
      desc1: row.desc1,
      address: row.address,
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
      max_attendees: row.max_attendees,
      election_status: row.election_status,
      deleted_by: row.deleted_by,
      deleted_at: row.deleted_at,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_by: row.updated_by,
      updated_at: row.updated_at,
    });
  }
}
