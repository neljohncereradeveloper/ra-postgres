import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ApplicationAccess } from '@domain/models/application-access.model';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
import {
  getFirstRow,
  hasAffectedRows,
  extractRows,
} from '@shared/utils/query-result.util';

@Injectable()
export class ApplicationAccessRepositoryImpl
  implements ApplicationAccessRepository<EntityManager>
{
  constructor(private readonly dataSource: DataSource) {}

  async create(
    applicationAccess: ApplicationAccess,
    manager: EntityManager,
  ): Promise<ApplicationAccess> {
    try {
      const query = `
        INSERT INTO applicationaccess (desc1, createdby, createdat)
        VALUES ($1, $2, $3)
        RETURNING * 
      `;

      const result = await manager.query(query, [
        applicationAccess.desc1,
        applicationAccess.createdBy || null,
        applicationAccess.createdAt || new Date(),
      ]);

      const row = getFirstRow(result);
      if (!row) {
        return null;
      }
      return this.rowToModel(row);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Application access already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<ApplicationAccess>,
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
        UPDATE applicationaccess
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex}
      `;

      const result = await manager.query(query, values);
      return hasAffectedRows(result);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Application access already exists');
      }
      throw error;
    }
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
  ): Promise<{
    data: ApplicationAccess[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
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

    // Apply search filter on description
    let paramIndex = 1;
    if (term) {
      whereConditions.push(`LOWER(desc1) LIKE $${paramIndex++}`);
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

    // Build data query
    const dataQuery = `
      SELECT 
        id,
        desc1,
        deletedby as "deletedBy",
        deletedat as "deletedAt",
        createdby as "createdBy",
        createdat as "createdAt",
        updatedby as "updatedBy",
        updatedat as "updatedAt"
      FROM applicationaccess
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS "totalRecords"
      FROM applicationaccess
      ${whereClause}
    `;

    // Execute both queries simultaneously
    const [dataRows, countResult] = await Promise.all([
      this.dataSource.query(dataQuery, [...queryParams, limit, skip]),
      this.dataSource.query(countQuery, queryParams),
    ]);

    // Extract total records
    const dataRowsArray = extractRows(dataRows);
    const countRow = getFirstRow(countResult);
    const totalRecords = parseInt(countRow?.totalRecords || '0', 10);

    // Map raw results to domain models
    const data = dataRowsArray.map((row: any) => this.rowToModel(row));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRecords / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

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

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<ApplicationAccess | null> {
    const query = `
      SELECT 
        id,
        desc1,
        deletedby as "deletedBy",
        deletedat as "deletedAt",
        createdby as "createdBy",
        createdat as "createdAt",
        updatedby as "updatedBy",
        updatedat as "updatedAt"
      FROM applicationaccess
      WHERE id = $1 AND deletedat IS NULL
    `;

    const result = await manager.query(query, [id]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async combobox(): Promise<ApplicationAccess[]> {
    const query = `
      SELECT 
        id,
        desc1,
        deletedby as "deletedBy",
        deletedat as "deletedAt",
        createdby as "createdBy",
        createdat as "createdAt",
        updatedby as "updatedBy",
        updatedat as "updatedAt"
      FROM applicationaccess
      WHERE deletedat IS NULL
      ORDER BY desc1 ASC
    `;

    const rows = await this.dataSource.query(query);
    return rows.map((row: any) => this.rowToModel(row));
  }

  async findByDesc(desc1: string): Promise<ApplicationAccess> {
    const query = `
      SELECT 
        id,
        desc1,
        deletedby as "deletedBy",
        deletedat as "deletedAt",
        createdby as "createdBy",
        createdat as "createdAt",
        updatedby as "updatedBy",
        updatedat as "updatedAt"
      FROM applicationaccess
      WHERE desc1 = $1 AND deletedat IS NULL
      LIMIT 1
    `;

    const result = await this.dataSource.query(query, [desc1]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): ApplicationAccess {
    return new ApplicationAccess({
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
