import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { District } from '@domain/models/district.model';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';
import { calculatePagination } from '@shared/utils/pagination.util';

@Injectable()
export class DistrictRepositoryImpl
  implements DistrictRepository<EntityManager>
{
  constructor() {}

  async create(district: District, manager: EntityManager): Promise<District> {
    try {
      const query = `
        INSERT INTO districts (
          election_id,
          desc1,
          created_by,
          created_at
        )
        VALUES (?, ?, ?, ?)
      `;

      const result = await manager.query(query, [
        district.electionId,
        district.desc1,
        district.createdBy || null,
        district.createdAt || new Date(),
      ]);

      // Get the inserted row
      const insertId = result.insertId;
      const selectQuery = `
        SELECT 
          id,
          election_id as electionId,
          desc1,
          deleted_by as deletedBy,
          deleted_at as deletedAt,
          created_by as createdBy,
          created_at as createdAt,
          updated_by as updatedBy,
          updated_at as updatedAt
        FROM districts
        WHERE id = ?
      `;

      const rows = await manager.query(selectQuery, [insertId]);
      return this.rowToModel(rows[0]);
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

      if (updateFields.desc1 !== undefined) {
        updateParts.push('desc1 = ?');
        values.push(updateFields.desc1);
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
        UPDATE districts
        SET ${updateParts.join(', ')}
        WHERE id = ? AND deleted_at IS NULL
      `;

      const result = await manager.query(query, values);
      return result.affectedRows && result.affectedRows > 0;
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
      whereConditions.push('deleted_at IS NOT NULL');
    } else {
      whereConditions.push('deleted_at IS NULL');
    }

    // Filter by election
    whereConditions.push('election_id = ?');
    queryParams.push(electionId);

    // Apply search filter on description
    if (term) {
      whereConditions.push('LOWER(desc1) LIKE ?');
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build data query
    const dataQuery = `
      SELECT 
        id,
        election_id as electionId,
        desc1,
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM districts
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS totalRecords
      FROM districts
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

  async findById(id: number, manager: EntityManager): Promise<District | null> {
    const query = `
      SELECT 
        id,
        election_id as electionId,
        desc1,
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM districts
      WHERE id = ? AND deleted_at IS NULL
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
  ): Promise<District | null> {
    const query = `
      SELECT 
        id,
        election_id as electionId,
        desc1,
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM districts
      WHERE desc1 = ? AND election_id = ? AND deleted_at IS NULL
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
  ): Promise<District[]> {
    const query = `
      SELECT 
        id,
        election_id as electionId,
        desc1,
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM districts
      WHERE election_id = ? AND deleted_at IS NULL
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
      FROM districts
      WHERE deleted_at IS NULL AND election_id = ?
    `;

    const result = await manager.query(query, [electionId]);
    return parseInt(result[0]?.count || '0', 10);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): District {
    return new District({
      id: row.id,
      electionId: row.electionId,
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
