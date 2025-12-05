import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { calculatePagination } from '@shared/utils/pagination.util';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { Candidate } from '@domain/models/candidate.model';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';
import {
  getInsertId,
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
          electionid,
          delegateid,
          positionid,
          districtid,
          displayname,
          createdby,
          createdat
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
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

      if (updateFields.displayName !== undefined) {
        updateParts.push(`displayname = $${paramIndex++}`);
        values.push(updateFields.displayName);
      }

      if (updateFields.positionId !== undefined) {
        updateParts.push(`positionid = $${paramIndex++}`);
        values.push(updateFields.positionId);
      }

      if (updateFields.districtId !== undefined) {
        updateParts.push(`districtid = $${paramIndex++}`);
        values.push(updateFields.districtId);
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
        c.id as id,
        c.electionid as electionid,
        c.positionid as positionid,
        c.districtid as districtid,
        c.delegateid as delegateid,
        c.displayname as displayname,
        d.accountid as accountid,
        d.accountname as accountname,
        p.desc1 AS position,
        dist.desc1 AS district,
        e.name AS election
      FROM candidates c
      LEFT JOIN delegates d ON c.delegateid = d.id
      LEFT JOIN positions p ON c.positionid = p.id
      LEFT JOIN districts dist ON c.districtid = dist.id
      LEFT JOIN elections e ON c.electionid = e.id
      WHERE c.id = $1 AND c.deletedat IS NULL
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
      whereConditions.push('c.deletedat IS NOT NULL');
    } else {
      whereConditions.push('c.deletedat IS NULL');
    }

    // Filter by election
    let paramIndex = 1;
    whereConditions.push(`c.electionid = $${paramIndex++}`);
    queryParams.push(electionId);

    // Apply search filter on display name
    if (term) {
      whereConditions.push(`LOWER(c.displayname) LIKE $${paramIndex++}`);
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build data query
    const dataQuery = `
      SELECT 
        c.id as id,
        c.delegateid as delegateid,
        c.displayname as displayname,
        d.accountid as accountid,
        d.accountname as accountname,
        p.desc1 AS position,
        dist.desc1 AS district,
        e.name AS election
      FROM candidates c
      LEFT JOIN delegates d ON c.delegateid = d.id
      LEFT JOIN positions p ON c.positionid = p.id
      LEFT JOIN districts dist ON c.districtid = dist.id
      LEFT JOIN elections e ON c.electionid = e.id
      ${whereClause}
      ORDER BY c.id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
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
    const dataRowsArray = extractRows(dataRows);
    const countRow = getFirstRow(countResult);
    const totalRecords = parseInt(countRow?.totalRecords || '0', 10);
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
      WHERE deletedat IS NULL AND electionid = $1
    `;

    const result = await manager.query(query, [electionId]);
    const row = getFirstRow(result);
    return parseInt(row?.count || '0', 10);
  }

  async getElectionCandidates(
    electionId: number,
    manager: EntityManager,
  ): Promise<any[]> {
    const query = `
      SELECT 
        p.desc1 AS position,
        p.maxcandidates AS positionmaxcandidates,
        p.termlimit AS positiontermlimit,
        c.id as candidateid,
        c.displayname as displayname
      FROM candidates c
      LEFT JOIN positions p ON c.positionid = p.id
      WHERE c.deletedat IS NULL AND c.electionid = $1
    `;

    const result = await manager.query(query, [electionId]);
    const rows = extractRows(result);
    return rows;
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): Candidate {
    return new Candidate({
      id: row.id,
      electionId: row.electionid,
      positionId: row.positionid,
      districtId: row.districtid,
      delegateId: row.delegateid,
      displayName: row.displayname,
      deletedBy: row.deletedby,
      deletedAt: row.deletedat,
      createdBy: row.createdby,
      createdAt: row.createdat,
      updatedBy: row.updatedby,
      updatedAt: row.updatedat,
    });
  }
}
