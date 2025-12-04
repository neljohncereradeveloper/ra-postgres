import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { UserRole } from '@domain/models/user-role.model';
import { UserRoleRepository } from '@domains/repositories/user-role.repository';

@Injectable()
export class UserRoleRepositoryImpl
  implements UserRoleRepository<EntityManager>
{
  constructor(private readonly dataSource: DataSource) {}

  async create(userRole: UserRole, manager: EntityManager): Promise<UserRole> {
    try {
      const query = `
        INSERT INTO userroles (desc1, createdby, createdat)
        VALUES ($1, $2, $3)
      `;

      const result = await manager.query(query, [
        userRole.desc1,
        userRole.createdBy || null,
        userRole.createdAt || new Date(),
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
        FROM userroles
        WHERE id = $1
      `;

      const rows = await manager.query(selectQuery, [insertId]);
      return this.rowToModel(rows[0]);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Userrole already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<UserRole>,
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
        UPDATE userroles
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex} AND deletedat IS NULL
      `;

      const result = await manager.query(query, values);
      return result.affectedRows && result.affectedRows > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Userrole already exists');
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
    data: UserRole[];
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

    // Apply search filter on description (fixed: was using 'name' but entity has 'desc1')
    let paramIndex = 1;
    if (term) {
      whereConditions.push(`LOWER(desc1) LIKE $${paramIndex++}`);
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build data query
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
      FROM userroles
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS totalRecords
      FROM userroles
      ${whereClause}
    `;

    // Execute both queries simultaneously
    const [dataRows, countResult] = await Promise.all([
      this.dataSource.query(dataQuery, [...queryParams, limit, skip]),
      this.dataSource.query(countQuery, queryParams),
    ]);

    // Extract total records
    const totalRecords = parseInt(countResult[0]?.totalRecords || '0', 10);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalRecords / limit);
    const nextPage = page < totalPages ? page + 1 : null;
    const previousPage = page > 1 ? page - 1 : null;

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

  async findById(id: number, manager: EntityManager): Promise<UserRole | null> {
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
      FROM userroles
      WHERE id = $1 AND deletedat IS NULL
    `;

    const rows = await manager.query(query, [id]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  async combobox(): Promise<UserRole[]> {
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
      FROM userroles
      WHERE deletedat IS NULL
      ORDER BY desc1 ASC
    `;

    const rows = await this.dataSource.query(query);
    return rows.map((row: any) => this.rowToModel(row));
  }

  async findByDesc(desc1: string): Promise<UserRole | null> {
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
      FROM userroles
      WHERE desc1 = $1 AND deletedat IS NULL
      LIMIT 1
    `;

    const rows = await this.dataSource.query(query, [desc1]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): UserRole {
    return new UserRole({
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
