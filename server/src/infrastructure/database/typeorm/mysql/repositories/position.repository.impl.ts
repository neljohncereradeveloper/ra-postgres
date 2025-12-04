import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { calculatePagination } from '@shared/utils/pagination.util';
import { PositionRepository } from '@domains/repositories/position.repository';
import { Position } from '@domain/models/position.model';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';

@Injectable()
export class PositionRepositoryImpl
  implements PositionRepository<EntityManager>
{
  constructor() {}

  async create(position: Position, manager: EntityManager): Promise<Position> {
    try {
      const query = `
        INSERT INTO positions (
          electionid,
          desc1,
          maxcandidates,
          termlimit,
          createdby,
          createdat
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      const result = await manager.query(query, [
        position.electionId,
        position.desc1,
        position.maxCandidates || null,
        position.termLimit || null,
        position.createdBy || null,
        position.createdAt || new Date(),
      ]);

      // Get the inserted row
      const insertId = result.insertId;
      const selectQuery = `
        SELECT 
          id,
          electionid as electionid,
          desc1,
          maxcandidates as maxcandidates,
          termlimit as termlimit,
          deletedby as deletedby,
          deletedat as deletedat,
          createdby as createdby,
          createdat as createdat,
          updatedby as updatedby,
          updatedat as updatedat
        FROM positions
        WHERE id = $1
      `;

      const rows = await manager.query(selectQuery, [insertId]);
      return this.rowToModel(rows[0]);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Position name already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<Position>,
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

      if (updateFields.maxCandidates !== undefined) {
        updateParts.push(`maxcandidates = $${paramIndex++}`);
        values.push(updateFields.maxCandidates);
      }

      if (updateFields.termLimit !== undefined) {
        updateParts.push(`termlimit = $${paramIndex++}`);
        values.push(updateFields.termLimit);
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
        UPDATE positions
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex} AND deletedat IS NULL
      `;

      const result = await manager.query(query, values);
      return result.affectedRows && result.affectedRows > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Position name already exists');
      }
      throw error;
    }
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    electionId: number,
    isDeleted: boolean,
    manager: EntityManager,
  ): Promise<{
    data: Position[];
    meta: PaginationMeta;
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

    // Filter by election
    let paramIndex = 1;
    whereConditions.push(`electionid = $${paramIndex++}`);
    queryParams.push(electionId);

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
        electionid as electionid,
        desc1,
        maxcandidates as maxcandidates,
        termlimit as termlimit,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM positions
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS totalRecords
      FROM positions
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

    // Map raw results to domain models
    const data = dataRows.map((row: any) => this.rowToModel(row));

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

  async findById(id: number, manager: EntityManager): Promise<Position | null> {
    const query = `
      SELECT 
        id,
        electionid as electionid,
        desc1,
        maxcandidates as maxcandidates,
        termlimit as termlimit,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM positions
      WHERE id = $1 AND deletedat IS NULL
    `;

    const rows = await manager.query(query, [id]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  async findByDescription(
    desc1: string,
    electionId: number,
    manager: EntityManager,
  ): Promise<Position | null> {
    const query = `
      SELECT 
        id,
        electionid as electionid,
        desc1,
        maxcandidates as maxcandidates,
        termlimit as termlimit,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM positions
      WHERE desc1 = $1 AND electionid = $2 AND deletedat IS NULL
      LIMIT 1
    `;

    const rows = await manager.query(query, [desc1, electionId]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  async combobox(
    electionId: number,
    manager: EntityManager,
  ): Promise<Position[]> {
    const query = `
      SELECT 
        id,
        electionid as electionid,
        desc1,
        maxcandidates as maxcandidates,
        termlimit as termlimit,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM positions
      WHERE electionid = $1 AND deletedat IS NULL
      ORDER BY desc1 ASC
    `;

    const rows = await manager.query(query, [electionId]);
    return rows.map((row: any) => this.rowToModel(row));
  }

  async findByElection(
    electionId: number,
    manager: EntityManager,
  ): Promise<Position[]> {
    const query = `
      SELECT 
        id,
        electionid as electionid,
        desc1,
        maxcandidates as maxcandidates,
        termlimit as termlimit,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM positions
      WHERE electionid = $1 AND deletedat IS NULL
      ORDER BY desc1 ASC
    `;

    const rows = await manager.query(query, [electionId]);
    return rows.map((row: any) => this.rowToModel(row));
  }

  async countByElection(
    electionId: number,
    manager: EntityManager,
  ): Promise<number> {
    const query = `
      SELECT COUNT(id) AS count
      FROM positions
      WHERE deletedat IS NULL AND electionid = $1
    `;

    const result = await manager.query(query, [electionId]);
    return parseInt(result[0]?.count || '0', 10);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): Position {
    return new Position({
      id: row.id,
      electionId: row.electionid,
      desc1: row.desc1,
      maxCandidates: row.maxcandidates,
      termLimit: row.termlimit,
      deletedBy: row.deletedby,
      deletedAt: row.deletedat,
      createdBy: row.createdby,
      createdAt: row.createdat,
      updatedBy: row.updatedby,
      updatedAt: row.updatedat,
    });
  }
}
