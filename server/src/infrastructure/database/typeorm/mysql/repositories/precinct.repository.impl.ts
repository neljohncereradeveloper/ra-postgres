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
      // Let database handle created_at (DEFAULT CURRENT_TIMESTAMP)
      // Only insert business data
      const query = `
        INSERT INTO precincts (desc1, created_by)
        VALUES ($1, $2)
        RETURNING *
      `;

      const result = await manager.query(query, [
        precinct.desc1,
        precinct.createdBy,
      ]);

      const savedRow = result[0];
      return this.rowToModel(savedRow);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
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
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateFields.desc1 !== undefined) {
        updates.push(`desc1 = $${paramIndex}`);
        values.push(updateFields.desc1);
        paramIndex++;
      }

      if (updateFields.deletedAt !== undefined) {
        updates.push(`deleted_at = $${paramIndex}`);
        values.push(updateFields.deletedAt);
        paramIndex++;
      }

      if (updateFields.deletedBy !== undefined) {
        updates.push(`deleted_by = $${paramIndex}`);
        values.push(updateFields.deletedBy);
        paramIndex++;
      }

      if (updateFields.updatedBy !== undefined) {
        updates.push(`updated_by = $${paramIndex}`);
        values.push(updateFields.updatedBy);
        paramIndex++;
      }

      if (updates.length === 0) {
        return false;
      }

      updates.push(`updated_at = $${paramIndex}`);
      values.push(new Date());
      paramIndex++;
      values.push(id);

      const query = `
        UPDATE precincts
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
      `;

      const result = await manager.query(query, values);
      return result.affectedRows > 0 || result.rowCount > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
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
    const params: any[] = [];
    let paramIndex = 1;

    // Build WHERE clause
    let whereClause = '';
    if (isArchived) {
      whereClause = 'WHERE deleted_at IS NOT NULL';
    } else {
      whereClause = 'WHERE deleted_at IS NULL';
    }

    // Add search term if provided
    if (term) {
      whereClause += ` AND LOWER(desc1) LIKE $${paramIndex}`;
      params.push(`%${term.toLowerCase()}%`);
      paramIndex++;
    }

    // Data query
    const dataQuery = `
      SELECT id, desc1, deleted_at, created_at, updated_at
      FROM precincts
      ${whereClause}
      ORDER BY id
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, skip);

    // Count query
    const countQuery = `
      SELECT COUNT(id) as "totalRecords"
      FROM precincts
      ${whereClause}
    `;

    // Execute both queries using DataSource
    const [dataRows, countResult] = await Promise.all([
      this.dataSource.query(dataQuery, params),
      this.dataSource.query(countQuery, params.slice(0, -2)), // Remove limit and offset params
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
      SELECT id, desc1, deleted_by, deleted_at, created_by, created_at, updated_by, updated_at
      FROM precincts
      WHERE id = $1
    `;

    const result = await manager.query(query, [id]);
    if (result.length === 0) {
      return null;
    }

    return this.rowToModel(result[0]);
  }

  async findByDescription(
    desc1: string,
    manager: EntityManager,
  ): Promise<Precinct | null> {
    const query = `
      SELECT id, desc1, deleted_by, deleted_at, created_by, created_at, updated_by, updated_at
      FROM precincts
      WHERE desc1 = $1 AND deleted_at IS NULL
    `;

    const result = await manager.query(query, [desc1]);
    if (result.length === 0) {
      return null;
    }

    return this.rowToModel(result[0]);
  }

  async combobox(): Promise<Precinct[]> {
    const query = `
      SELECT id, desc1
      FROM precincts
      WHERE deleted_at IS NULL
      ORDER BY desc1
    `;

    const result = await this.dataSource.query(query);
    return result.map((row) => this.rowToModel(row));
  }

  // Helper: Convert database row to domain model
  private rowToModel(row: any): Precinct {
    return new Precinct({
      id: row.id,
      desc1: row.desc1,
      deletedBy: row.deleted_by || row.deletedBy,
      deletedAt: row.deleted_at || row.deletedAt,
      createdBy: row.created_by || row.createdBy,
      createdAt: row.created_at || row.createdAt,
      updatedBy: row.updated_by || row.updatedBy,
      updatedAt: row.updated_at || row.updatedAt,
    });
  }
}
