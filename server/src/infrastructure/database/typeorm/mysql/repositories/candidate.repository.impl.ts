import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { calculatePagination } from '@shared/utils/pagination.util';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { Candidate } from '@domain/models/candidate.model';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';
import {
  getFirstRow,
  hasAffectedRows,
  extractRows,
} from '@shared/utils/query-result.util';

@Injectable()
export class CandidateRepositoryImpl
  implements CandidateRepository<EntityManager>
{
  constructor() {}

  async create(
    candidate: Candidate,
    manager: EntityManager,
  ): Promise<Candidate> {
    try {
      const query = `
        INSERT INTO candidates (
          election_id,
          delegate_id,
          position_id,
          district_id,
          display_name,
          created_by,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await manager.query(query, [
        candidate.election_id,
        candidate.delegate_id,
        candidate.position_id,
        candidate.district_id,
        candidate.display_name,
        candidate.created_by || null,
        candidate.created_at || new Date(),
      ]);

      const row = getFirstRow(result);
      if (!row) {
        return null;
      }

      return this.rowToModel(row);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'Candidate name already exists in the current election',
        );
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<Candidate>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const updateParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateFields.display_name !== undefined) {
        updateParts.push(`display_name = $${paramIndex++}`);
        values.push(updateFields.display_name);
      }

      if (updateFields.position_id !== undefined) {
        updateParts.push(`position_id = $${paramIndex++}`);
        values.push(updateFields.position_id);
      }

      if (updateFields.district_id !== undefined) {
        updateParts.push(`district_id = $${paramIndex++}`);
        values.push(updateFields.district_id);
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
        UPDATE candidates
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex}
      `;

      const result = await manager.query(query, values);
      return hasAffectedRows(result);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Candidate name already exists');
      }
      throw error;
    }
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<Candidate | null> {
    const query = `
      SELECT 
        c.id,
        c.election_id,
        c.position_id,
        c.district_id,
        c.delegate_id,
        c.display_name,
        d.account_id,
        d.account_name,
        p.desc1,
        dist.desc1,
        e.name,
      FROM candidates c
      LEFT JOIN delegates d ON c.delegate_id = d.id
      LEFT JOIN positions p ON c.position_id = p.id
      LEFT JOIN districts dist ON c.district_id = dist.id
      LEFT JOIN elections e ON c.election_id = e.id
      WHERE c.id = $1 AND c.deleted_at IS NULL
    `;

    const result = await manager.query(query, [id]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return row;
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_deleted: boolean,
    election_id: number,
    manager: EntityManager,
  ): Promise<{
    data: Candidate[];
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
    if (is_deleted) {
      whereConditions.push('c.deleted_at IS NOT NULL');
    } else {
      whereConditions.push('c.deleted_at IS NULL');
    }

    // Filter by election
    let paramIndex = 1;
    whereConditions.push(`c.election_id = $${paramIndex++}`);
    queryParams.push(election_id);

    // Apply search filter on display name
    if (term) {
      whereConditions.push(`LOWER(c.display_name) LIKE $${paramIndex++}`);
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build data query
    const dataQuery = `
      SELECT 
        c.id,
        c.delegate_id,
        c.display_name,
        d.account_id,
        d.account_name,
        p.desc1,
        dist.desc1,
        e.name,
      FROM candidates c
      LEFT JOIN delegates d ON c.delegate_id = d.id
      LEFT JOIN positions p ON c.position_id = p.id
      LEFT JOIN districts dist ON c.district_id = dist.id
      LEFT JOIN elections e ON c.election_id = e.id
      ${whereClause}
      ORDER BY c.id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(c.id) AS "totalRecords"
      FROM candidates c
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

    return {
      data: data_rows_array,
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

  async countByElection(
    election_id: number,
    manager: EntityManager,
  ): Promise<number> {
    const query = `
      SELECT COUNT(id) AS "count"
      FROM candidates
      WHERE deleted_at IS NULL AND election_id = $1
    `;

    const result = await manager.query(query, [election_id]);
    const row = getFirstRow(result);
    return parseInt(row?.count || '0', 10);
  }

  async getElectionCandidates(
    election_id: number,
    manager: EntityManager,
  ): Promise<any[]> {
    const query = `
      SELECT 
        p.desc1,
        p.max_candidates,
        p.term_limit,
        c.id,
        c.display_name,
      FROM candidates c
      LEFT JOIN positions p ON c.position_id = p.id
      WHERE c.deleted_at IS NULL AND c.election_id = $1
    `;

    const result = await manager.query(query, [election_id]);
    const rows = extractRows(result);
    return rows;
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): Candidate {
    return new Candidate({
      id: row.id,
      election_id: row.election_id,
      position_id: row.position_id,
      district_id: row.district_id,
      delegate_id: row.delegate_id,
      display_name: row.display_name,
      deleted_by: row.deleted_by,
      deleted_at: row.deleted_at,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_by: row.updated_by,
      updated_at: row.updated_at,
    });
  }
}
