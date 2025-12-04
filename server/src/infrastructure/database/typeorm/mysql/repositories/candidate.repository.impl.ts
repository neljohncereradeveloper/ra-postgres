import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { calculatePagination } from '@shared/utils/pagination.util';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { Candidate } from '@domain/models/candidate.model';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';

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
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await manager.query(query, [
        candidate.electionId,
        candidate.delegateId,
        candidate.positionId,
        candidate.districtId,
        candidate.displayName,
        candidate.createdBy || null,
        candidate.createdAt || new Date(),
      ]);

      // Get the inserted row
      const insertId = result.insertId;
      const selectQuery = `
        SELECT 
          id,
          election_id as electionId,
          delegate_id as delegateId,
          position_id as positionId,
          district_id as districtId,
          display_name as displayName,
          deleted_by as deletedBy,
          deleted_at as deletedAt,
          created_by as createdBy,
          created_at as createdAt,
          updated_by as updatedBy,
          updated_at as updatedAt
        FROM candidates
        WHERE id = ?
      `;

      const rows = await manager.query(selectQuery, [insertId]);
      return this.rowToModel(rows[0]);
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

      if (updateFields.displayName !== undefined) {
        updateParts.push('display_name = ?');
        values.push(updateFields.displayName);
      }

      if (updateFields.positionId !== undefined) {
        updateParts.push('position_id = ?');
        values.push(updateFields.positionId);
      }

      if (updateFields.districtId !== undefined) {
        updateParts.push('district_id = ?');
        values.push(updateFields.districtId);
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
        UPDATE candidates
        SET ${updateParts.join(', ')}
        WHERE id = ?
      `;

      const result = await manager.query(query, values);
      return result.affectedRows && result.affectedRows > 0;
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
        c.id as id,
        c.election_id as electionId,
        c.position_id as positionId,
        c.district_id as districtId,
        c.delegate_id as delegateId,
        c.display_name as displayName,
        d.account_id as accountId,
        d.account_name as accountName,
        p.desc1 AS position,
        dist.desc1 AS district,
        e.name AS election
      FROM candidates c
      LEFT JOIN delegates d ON c.delegate_id = d.id
      LEFT JOIN positions p ON c.position_id = p.id
      LEFT JOIN districts dist ON c.district_id = dist.id
      LEFT JOIN elections e ON c.election_id = e.id
      WHERE c.id = ? AND c.deleted_at IS NULL
    `;

    const rows = await manager.query(query, [id]);
    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
    electionId: number,
    manager: EntityManager,
  ): Promise<{
    data: any[];
    meta: PaginationMeta;
  }> {
    const skip = (page - 1) * limit;

    // Build WHERE clause
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    // Filter by deletion status
    if (isDeleted) {
      whereConditions.push('c.deleted_at IS NOT NULL');
    } else {
      whereConditions.push('c.deleted_at IS NULL');
    }

    // Filter by election
    whereConditions.push('c.election_id = ?');
    queryParams.push(electionId);

    // Apply search filter on display name
    if (term) {
      whereConditions.push('LOWER(c.display_name) LIKE ?');
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build data query
    const dataQuery = `
      SELECT 
        c.id as id,
        c.delegate_id as delegateId,
        c.display_name as displayName,
        d.account_id as accountId,
        d.account_name as accountName,
        p.desc1 AS position,
        dist.desc1 AS district,
        e.name AS election
      FROM candidates c
      LEFT JOIN delegates d ON c.delegate_id = d.id
      LEFT JOIN positions p ON c.position_id = p.id
      LEFT JOIN districts dist ON c.district_id = dist.id
      LEFT JOIN elections e ON c.election_id = e.id
      ${whereClause}
      ORDER BY c.id DESC
      LIMIT ? OFFSET ?
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(c.id) AS totalRecords
      FROM candidates c
      ${whereClause}
    `;

    // Execute both queries simultaneously
    const [dataRows, countResult] = await Promise.all([
      manager.query(dataQuery, [...queryParams, limit, skip]),
      manager.query(countQuery, queryParams),
    ]);

    // Extract total records
    const totalRecords = parseInt(countResult[0]?.totalRecords || '0', 10);
    const { totalPages, nextPage, previousPage } = calculatePagination(
      totalRecords,
      page,
      limit,
    );

    return {
      data: dataRows,
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

  async countByElection(
    electionId: number,
    manager: EntityManager,
  ): Promise<number> {
    const query = `
      SELECT COUNT(id) AS count
      FROM candidates
      WHERE deleted_at IS NULL AND election_id = ?
    `;

    const result = await manager.query(query, [electionId]);
    return parseInt(result[0]?.count || '0', 10);
  }

  async getElectionCandidates(
    electionId: number,
    manager: EntityManager,
  ): Promise<any[]> {
    const query = `
      SELECT 
        p.desc1 AS position,
        p.max_candidates AS positionMaxCandidates,
        p.term_limit AS positionTermLimit,
        c.id as candidateId,
        c.display_name as displayName
      FROM candidates c
      LEFT JOIN positions p ON c.position_id = p.id
      WHERE c.deleted_at IS NULL AND c.election_id = ?
    `;

    const rows = await manager.query(query, [electionId]);
    return rows;
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): Candidate {
    return new Candidate({
      id: row.id,
      electionId: row.electionId,
      positionId: row.positionId,
      districtId: row.districtId,
      delegateId: row.delegateId,
      displayName: row.displayName,
      deletedBy: row.deletedBy,
      deletedAt: row.deletedAt,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedBy: row.updatedBy,
      updatedAt: row.updatedAt,
    });
  }
}
