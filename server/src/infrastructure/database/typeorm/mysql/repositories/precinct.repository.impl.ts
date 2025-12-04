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
        INSERT INTO precincts (desc1, created_by, created_at)
        VALUES (?, ?, ?)
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
          deleted_by as deletedBy,
          deleted_at as deletedAt,
          created_by as createdBy,
          created_at as createdAt,
          updated_by as updatedBy,
          updated_at as updatedAt
        FROM precincts
        WHERE id = ?
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

      if (updateFields.desc1 !== undefined) {
        updateParts.push('desc1 = ?');
        values.push(updateFields.desc1);
      }

      if (updateFields.deletedAt !== undefined) {
        updateParts.push('deleted_at = ?');
        values.push(updateFields.deletedAt);
      }

      if (updateFields.deletedBy !== undefined) {
        updateParts.push('deleted_by = ?');
        values.push(updateFields.deletedBy);
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

      // Always update updated_at if not explicitly set
      if (updateFields.updatedAt === undefined) {
        updateParts.push('updated_at = ?');
        values.push(new Date());
      }

      values.push(id);

      const query = `
        UPDATE precincts
        SET ${updateParts.join(', ')}
        WHERE id = ?
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
      whereConditions.push('deleted_at IS NOT NULL');
    } else {
      whereConditions.push('deleted_at IS NULL');
    }

    // Add search term if provided
    if (term) {
      whereConditions.push('LOWER(desc1) LIKE ?');
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Data query
    const dataQuery = `
      SELECT 
        id,
        desc1,
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM precincts
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
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
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM precincts
      WHERE id = ?
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
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM precincts
      WHERE desc1 = ? AND deleted_at IS NULL
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
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
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
      deletedBy: row.deletedBy,
      deletedAt: row.deletedAt,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedBy: row.updatedBy,
      updatedAt: row.updatedAt,
    });
  }
}
