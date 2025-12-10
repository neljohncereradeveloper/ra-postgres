import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { District } from '@domain/models/district.model';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';
import { calculatePagination } from '@shared/utils/pagination.util';
import {
  getInsertId,
  getFirstRow,
  hasAffectedRows,
  extractRows,
} from '@shared/utils/query-result.util';

@Injectable()
export class DistrictRepositoryImpl
  implements DistrictRepository<EntityManager>
{
  constructor() {}

  async create(district: District, manager: EntityManager): Promise<District> {
    try {
      const query = `
        INSERT INTO districts (
          electionid,
          desc1,
          createdby,
          createdat
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const result = await manager.query(query, [
        district.electionid,
        district.desc1,
        district.createdby || null,
        district.createdat || new Date(),
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
    updateFields: Partial<District>,
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

      if (updateFields.updatedby !== undefined) {
        updateParts.push(`updatedby = $${paramIndex++}`);
        values.push(updateFields.updatedby);
      }

      if (updateFields.updatedat !== undefined) {
        updateParts.push(`updatedat = $${paramIndex++}`);
        values.push(updateFields.updatedat);
      }

      if (updateParts.length === 0) {
        return false;
      }

      values.push(id);

      const query = `
        UPDATE districts
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex} AND deletedat IS NULL
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
    isDeleted: boolean,
    electionId: number,
    manager: EntityManager,
  ): Promise<{
    data: District[];
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
        electionid,
        desc1,
        deletedby,
        deletedat,
        createdby,
        createdat,
        updatedby,
        updatedat,
      FROM districts
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS "totalRecords"
      FROM districts
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

    // Map raw results to domain models
    const data = dataRowsArray.map((row: any) => this.rowToModel(row));

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

  async findById(id: number, manager: EntityManager): Promise<District | null> {
    const query = `
      SELECT 
        id,
        electionid,
        desc1,
        deletedby,
        deletedat,
        createdby,
        createdat,
        updatedby,
        updatedat,
      FROM districts
      WHERE id = $1 AND deletedat IS NULL
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
    electionId: number,
    manager: EntityManager,
  ): Promise<District | null> {
    const query = `
      SELECT 
        id,
        electionid,
        desc1,
        deletedby,
        deletedat,
        createdby,
        createdat,
        updatedby,
        updatedat,
      FROM districts
      WHERE desc1 = $1 AND electionid = $2 AND deletedat IS NULL
      LIMIT 1
    `;

    const result = await manager.query(query, [desc1, electionId]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async combobox(
    electionId: number,
    manager: EntityManager,
  ): Promise<District[]> {
    const query = `
      SELECT 
        id,
        electionid,
        desc1,
        deletedby,
        deletedat,
        createdby,
        createdat,
        updatedby,
        updatedat,
      FROM districts
      WHERE electionid = $1 AND deletedat IS NULL
      ORDER BY desc1 ASC
    `;

    const result = await manager.query(query, [electionId]);
    const rows = extractRows(result);
    return rows.map((row: any) => this.rowToModel(row));
  }

  async countByElection(
    electionId: number,
    manager: EntityManager,
  ): Promise<number> {
    const query = `
      SELECT COUNT(id) AS "count"
      FROM districts
      WHERE deletedat IS NULL AND electionid = $1
    `;

    const result = await manager.query(query, [electionId]);
    const row = getFirstRow(result);
    return parseInt(row?.count || '0', 10);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): District {
    return new District({
      id: row.id,
      electionid: row.electionid,
      desc1: row.desc1,
      deletedby: row.deletedby,
      deletedat: row.deletedat,
      createdby: row.createdby,
      createdat: row.createdat,
      updatedby: row.updatedby,
      updatedat: row.updatedat,
    });
  }
}
