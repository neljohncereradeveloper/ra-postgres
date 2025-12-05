import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { calculatePagination } from '@shared/utils/pagination.util';
import { Election } from '@domain/models/election.model';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { PaginationMeta } from '@shared/interfaces/pagination.interface';
import { ElectionStatus } from '@domain/enums/index';
import {
  getFirstRow,
  hasAffectedRows,
  extractRows,
} from '@shared/utils/query-result.util';

@Injectable()
export class ElectionRepositoryImpl
  implements ElectionRepository<EntityManager>
{
  constructor(private readonly dataSource: DataSource) {}

  async create(election: Election, manager: EntityManager): Promise<Election> {
    try {
      const query = `
        INSERT INTO elections (
          name,
          desc1,
          address,
          date,
          starttime,
          endtime,
          maxattendees,
          electionstatus,
          createdby,
          createdat
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const result = await manager.query(query, [
        election.name,
        election.desc1 || null,
        election.address,
        election.date || null,
        election.startTime || null,
        election.endTime || null,
        election.maxAttendees || null,
        election.electionStatus || ElectionStatus.SCHEDULED,
        election.createdBy || null,
        election.createdAt || new Date(),
      ]);

      const row = getFirstRow(result);
      if (!row) {
        return null;
      }
      return this.rowToModel(row);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Election name already exists');
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<Election>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const updateParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updateFields.name !== undefined) {
        updateParts.push(`name = $${paramIndex++}`);
        values.push(updateFields.name);
      }

      if (updateFields.desc1 !== undefined) {
        updateParts.push(`desc1 = $${paramIndex++}`);
        values.push(updateFields.desc1);
      }

      if (updateFields.address !== undefined) {
        updateParts.push(`address = $${paramIndex++}`);
        values.push(updateFields.address);
      }

      if (updateFields.date !== undefined) {
        updateParts.push(`date = $${paramIndex++}`);
        values.push(updateFields.date);
      }

      if (updateFields.startTime !== undefined) {
        updateParts.push(`starttime = $${paramIndex++}`);
        values.push(updateFields.startTime);
      }

      if (updateFields.endTime !== undefined) {
        updateParts.push(`endtime = $${paramIndex++}`);
        values.push(updateFields.endTime);
      }

      if (updateFields.maxAttendees !== undefined) {
        updateParts.push(`maxattendees = $${paramIndex++}`);
        values.push(updateFields.maxAttendees);
      }

      if (updateFields.electionStatus !== undefined) {
        updateParts.push(`electionstatus = $${paramIndex++}`);
        values.push(updateFields.electionStatus);
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
        UPDATE elections
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex} AND deletedat IS NULL
      `;

      const result = await manager.query(query, values);
      return hasAffectedRows(result);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Election name already exists');
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
    data: Election[];
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

    // Apply search filter on name
    let paramIndex = 1;
    if (term) {
      whereConditions.push(`LOWER(name) LIKE $${paramIndex++}`);
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Build data query
    const dataQuery = `
      SELECT 
        id,
        name,
        desc1,
        address,
        date,
        starttime as starttime,
        endtime as endtime,
        maxattendees as maxattendees,
        electionstatus as electionstatus,
        deletedat as deletedat
      FROM elections
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(id) AS totalRecords
      FROM elections
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

  async findById(
    id: number,
    manager?: EntityManager,
  ): Promise<Election | null> {
    if (!manager) {
      return null;
    }

    const query = `
      SELECT 
        id,
        name,
        desc1,
        address,
        date,
        starttime as starttime,
        endtime as endtime,
        maxattendees as maxattendees,
        electionstatus as electionstatus,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM elections
      WHERE id = $1 AND deletedat IS NULL
    `;

    const result = await manager.query(query, [id]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async combobox(): Promise<Election[]> {
    const query = `
      SELECT 
        id,
        name,
        desc1,
        address,
        date,
        starttime as starttime,
        endtime as endtime,
        maxattendees as maxattendees,
        electionstatus as electionstatus,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM elections
      WHERE deletedat IS NULL
      ORDER BY name ASC
    `;

    const rows = await this.dataSource.query(query);
    return rows.map((row: any) => this.rowToModel(row));
  }

  async comboboxRetrieveScheduledElections(): Promise<Election[]> {
    const query = `
      SELECT 
        id,
        name,
        desc1,
        address,
        date,
        starttime as starttime,
        endtime as endtime,
        maxattendees as maxattendees,
        electionstatus as electionstatus,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM elections
      WHERE deletedat IS NULL AND electionstatus = $1
      ORDER BY name ASC
    `;

    const result = await this.dataSource.query(query, [
      ElectionStatus.SCHEDULED,
    ]);
    const rows = extractRows(result);
    return rows.map((row: any) => this.rowToModel(row));
  }

  async findByName(
    name: string,
    manager: EntityManager,
  ): Promise<Election | null> {
    const query = `
      SELECT 
        id,
        name,
        desc1,
        address,
        date,
        starttime as starttime,
        endtime as endtime,
        maxattendees as maxattendees,
        electionstatus as electionstatus,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM elections
      WHERE name = $1 AND deletedat IS NULL
      LIMIT 1
    `;

    const result = await manager.query(query, [name]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): Election {
    return new Election({
      id: row.id,
      name: row.name,
      desc1: row.desc1,
      address: row.address,
      date: row.date,
      startTime: row.starttime,
      endTime: row.endtime,
      maxAttendees: row.maxattendees,
      electionStatus: row.electionstatus,
      deletedBy: row.deletedby,
      deletedAt: row.deletedat,
      createdBy: row.createdby,
      createdAt: row.createdat,
      updatedBy: row.updatedby,
      updatedAt: row.updatedat,
    });
  }
}
