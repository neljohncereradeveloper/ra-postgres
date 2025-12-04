import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';
import { calculatePagination } from '@shared/utils/pagination.util';
import { PrecinctRepository } from '@domains/repositories/precinct.repository';
import { Precinct } from '@domain/models/precinct.model';

@Injectable()
export class PrecinctRepositoryImpl
  implements PrecinctRepository<EntityManager>
{
  constructor(private readonly dataSource: DataSource) {}
  async create(precinct: Precinct, manager: EntityManager): Promise<Precinct> {
    try {
      const query = `
        INSERT INTO precincts (desc1, createdby, createdat)
        VALUES ($1, $2, $3)
      `;

      const result = await manager.query(query, [
        precinct.desc1,
        precinct.createdBy || null,
        precinct.createdAt || new Date(),
      ]);

      // Get the inserted row
      const insertId = result.insertId;
      const selectQuery = `
        SELECT 
          id,
          desc1,
          deletedby as deletedby,
          deletedat as deletedat,
          createdby as createdby,
          createdat as createdat,
          updatedby as updatedby,
          updatedat as updatedat
        FROM precincts
        WHERE id = $1
      `;

      const rows = await manager.query(selectQuery, [insertId]);
      return this.rowToModel(rows[0]);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Precinct name already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<Precinct>,
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

      if (updateFields.deletedAt !== undefined) {
        updateParts.push(`deletedat = $${paramIndex++}`);
        values.push(updateFields.deletedAt);
      }

      if (updateFields.deletedBy !== undefined) {
        updateParts.push(`deletedby = $${paramIndex++}`);
        values.push(updateFields.deletedBy);
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

      // Always update updatedat if not explicitly set
      if (updateFields.updatedAt === undefined) {
        updateParts.push(`updatedat = $${paramIndex++}`);
        values.push(new Date());
      }

      values.push(id);

      const query = `
        UPDATE precincts
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex}
      `;

      const result = await manager.query(query, values);
      return result.affectedRows && result.affectedRows > 0;
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
    isArchived: boolean,
  ): Promise<{
    data: Precinct[];
    meta: PaginationMeta;
  }> {
    const skip = (page - 1) * limit;

    // Build WHERE clause
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    if (isArchived) {
      whereConditions.push('deletedat IS NOT NULL');
    } else {
      whereConditions.push('deletedat IS NULL');
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
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM precincts
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    // Count query
    const countQuery = `
      SELECT COUNT(id) AS totalRecords
      FROM precincts
      ${whereClause}
    `;

    // Execute both queries using DataSource
    const [dataRows, countResult] = await Promise.all([
      this.dataSource.query(dataQuery, [...queryParams, limit, skip]),
      this.dataSource.query(countQuery, queryParams),
    ]);

    const data = dataRows.map((row) => this.rowToModel(row));
    const totalRecords = parseInt(countResult[0]?.totalRecords || '0', 10);
    const { totalPages, nextPage, previousPage } = calculatePagination(
      totalRecords,
      page,
      limit,
    );

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

  async findById(id: number, manager: EntityManager): Promise<Precinct | null> {
    const query = `
      SELECT 
        id,
        desc1,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM precincts
      WHERE id = $1
    `;

    const rows = await manager.query(query, [id]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  async findByDescription(
    desc1: string,
    manager: EntityManager,
  ): Promise<Precinct | null> {
    const query = `
      SELECT 
        id,
        desc1,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM precincts
      WHERE desc1 = $1 AND deletedat IS NULL
      LIMIT 1
    `;

    const rows = await manager.query(query, [desc1]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  async combobox(): Promise<Precinct[]> {
    const query = `
      SELECT 
        id,
        desc1,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM precincts
      WHERE deletedat IS NULL
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
      deletedBy: row.deletedby,
      deletedAt: row.deletedat,
      createdBy: row.createdby,
      createdAt: row.createdat,
      updatedBy: row.updatedby,
      updatedAt: row.updatedat,
    });
  }
}
