import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Delegate } from '@domain/models/delegate.model';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import {
  getFirstRow,
  hasAffectedRows,
  extractRows,
} from '@shared/utils/query-result.util';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

@Injectable()
export class DelegateRepositoryImpl
  implements DelegateRepository<EntityManager>
{
  constructor() {}

  async create(delegate: Delegate, manager: EntityManager): Promise<Delegate> {
    try {
      const query = `
        INSERT INTO delegates (
          election_id,
          branch,
          account_id,
          account_name,
          age,
          birth_date,
          address,
          tell,
          cell,
          date_opened,
          client_type,
          loan_status,
          balance,
          mev_status,
          has_voted,
          control_number,
          created_by,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `;

      const result = await manager.query(query, [
        delegate.election_id,
        delegate.branch,
        delegate.account_id,
        delegate.account_name,
        delegate.age || null,
        delegate.birth_date || null,
        delegate.address || null,
        delegate.tell || null,
        delegate.cell || null,
        delegate.date_opened || null,
        delegate.client_type || null,
        delegate.loan_status,
        delegate.balance,
        delegate.mev_status,
        delegate.has_voted || false,
        delegate.control_number,
        delegate.created_by || null,
        delegate.created_at || new Date(),
      ]);

      const row = getFirstRow(result);
      if (!row) {
        return null;
      }
      return this.rowToModel(row);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(error.sqlMessage);
      }
      throw error;
    }
  }

  async update(
    id: number,
    update_fields: Partial<Delegate>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const updateParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (update_fields.branch !== undefined) {
        updateParts.push(`branch = $${paramIndex++}`);
        values.push(update_fields.branch);
      }

      if (update_fields.account_id !== undefined) {
        updateParts.push(`account_id = $${paramIndex++}`);
        values.push(update_fields.account_id);
      }

      if (update_fields.account_name !== undefined) {
        updateParts.push(`account_name = $${paramIndex++}`);
        values.push(update_fields.account_name);
      }

      if (update_fields.age !== undefined) {
        updateParts.push(`age = $${paramIndex++}`);
        values.push(update_fields.age);
      }

      if (update_fields.birth_date !== undefined) {
        updateParts.push(`birthdate = $${paramIndex++}`);
        values.push(update_fields.birth_date);
      }

      if (update_fields.address !== undefined) {
        updateParts.push(`address = $${paramIndex++}`);
        values.push(update_fields.address);
      }

      if (update_fields.tell !== undefined) {
        updateParts.push(`tell = $${paramIndex++}`);
        values.push(update_fields.tell);
      }

      if (update_fields.cell !== undefined) {
        updateParts.push(`cell = $${paramIndex++}`);
        values.push(update_fields.cell);
      }

      if (update_fields.date_opened !== undefined) {
        updateParts.push(`date_opened = $${paramIndex++}`);
        values.push(update_fields.date_opened);
      }

      if (update_fields.client_type !== undefined) {
        updateParts.push(`client_type = $${paramIndex++}`);
        values.push(update_fields.client_type);
      }

      if (update_fields.balance !== undefined) {
        updateParts.push(`balance = $${paramIndex++}`);
        values.push(update_fields.balance);
      }

      if (update_fields.loan_status !== undefined) {
        updateParts.push(`loan_status = $${paramIndex++}`);
        values.push(update_fields.loan_status);
      }

      if (update_fields.mev_status !== undefined) {
        updateParts.push(`mev_status = $${paramIndex++}`);
        values.push(update_fields.mev_status);
      }

      if (update_fields.has_voted !== undefined) {
        updateParts.push(`has_voted = $${paramIndex++}`);
        values.push(update_fields.has_voted);
      }

      if (update_fields.control_number !== undefined) {
        updateParts.push(`control_number = $${paramIndex++}`);
        values.push(update_fields.control_number);
      }

      if (update_fields.updated_by !== undefined) {
        updateParts.push(`updated_by = $${paramIndex++}`);
        values.push(update_fields.updated_by);
      }

      if (update_fields.updated_at !== undefined) {
        updateParts.push(`updated_at = $${paramIndex++}`);
        values.push(update_fields.updated_at);
      }

      if (updateParts.length === 0) {
        return false;
      }

      values.push(id);

      const query = `
        UPDATE delegates
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex} AND deleted_at IS NULL
      `;

      const result = await manager.query(query, values);
      return hasAffectedRows(result);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(error.sqlMessage);
      }
      throw error;
    }
  }

  async findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    election_id: number,
    manager: EntityManager,
  ): Promise<PaginatedResult<Delegate>> {
    const skip = (page - 1) * limit;

    // Build WHERE conditions
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    // Filter by deletion status
    if (is_archived) {
      whereConditions.push('d.deleted_at IS NOT NULL');
    } else {
      whereConditions.push('d.deleted_at IS NULL');
    }

    // Filter by election ID
    let paramIndex = 1;
    whereConditions.push(`d.election_id = $${paramIndex++}`);
    queryParams.push(election_id);

    // Apply search filter on account name
    if (term) {
      whereConditions.push(`LOWER(d.account_name) LIKE $${paramIndex++}`);
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Build data query
    const dataQuery = `
      SELECT 
        d.id,
        d.branch,
        d.account_id,
        d.account_name,
        d.age,
        d.birth_date,
        d.address,
        d.tell,
        d.cell,
        d.date_opened,
        d.client_type,
        d.balance,
        d.loan_status,
        d.mev_status,
        d.deleted_at,
        d.election_id,
        e.name,
        d.has_voted,
        d.control_number,
      FROM delegates d
      INNER JOIN elections e ON d.election_id = e.id
      WHERE ${whereClause}
      ORDER BY d.account_name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(d.id) AS "totalRecords"
      FROM delegates d
      INNER JOIN elections e ON d.election_id = e.id
      WHERE ${whereClause}
    `;

    // Execute both queries simultaneously
    const [data_rows, count_result] = await Promise.all([
      manager.query(dataQuery, [...queryParams, limit, skip]),
      manager.query(countQuery, queryParams),
    ]);

    // Extract total records
    const data_rows_array = extractRows(data_rows);
    const count_row = getFirstRow(count_result);
    const total_records = parseInt(count_row?.total_records || '0', 10);

    // Map raw results to domain models
    const data = data_rows_array.map((row: any) => this.rowToModel(row));

    // Calculate pagination metadata
    const total_pages = Math.ceil(total_records / limit);
    const next_page = page < total_pages ? page + 1 : null;
    const previous_page = page > 1 ? page - 1 : null;

    return {
      data,
      meta: {
        page,
        limit,
        total_records,
        total_pages,
        next_page,
        previous_page,
      },
    };
  }

  async findById(id: number, manager: EntityManager): Promise<Delegate | null> {
    const query = `
      SELECT 
        id,
        election_id,
        branch,
        account_id,
        account_name,
        age,
        birth_date,
        address,
        tell,
        cell,
        date_opened,
        client_type,
        loan_status,
        balance,
        mev_status,
        has_voted,
        control_number,
        deleted_by,
        deleted_at,
        created_by,
        created_at,
        updated_by,
        updated_at,
      FROM delegates
      WHERE id = $1 AND deleted_at IS NULL
    `;

    const result = await manager.query(query, [id]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async findByControlNumberAndElectionId(
    control_number: string,
    election_id: number,
    manager: EntityManager,
  ): Promise<Delegate> {
    const query = `
      SELECT 
        id,
        election_id,
        branch,
        account_id,
        account_name,
        age,
        birth_date,
        address,
        tell,
        cell,
        date_opened,
        client_type,
        loan_status,
        balance,
        mev_status,
        has_voted,
        control_number,
        deleted_by,
        deleted_at,
        created_by,
        created_at,
        updated_by,
        updated_at,
      FROM delegates
      WHERE control_number = $1 AND election_id = $2 AND deleted_at IS NULL
      LIMIT 1
    `;

    const result = await manager.query(query, [control_number, election_id]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async countByElection(
    election_id: number,
    manager: EntityManager,
  ): Promise<number> {
    const countQuery = `
      SELECT COUNT(id) AS "count"
      FROM delegates
      WHERE deleted_at IS NULL
      AND election_id = $1
    `;

    const result = await manager.query(countQuery, [election_id]);
    const row = getFirstRow(result);
    return parseInt(row?.count || '0', 10);
  }

  async markAsVoted(
    delegate_id: number,
    manager: EntityManager,
  ): Promise<void> {
    const query = `
      UPDATE delegates
      SET has_voted = $1
      WHERE id = $2
    `;

    await manager.query(query, [true, delegate_id]);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): Delegate {
    return new Delegate({
      id: row.id,
      branch: row.branch,
      election_id: row.election_id,
      account_id: row.account_id,
      account_name: row.account_name,
      age: row.age,
      balance: row.balance,
      loan_status: row.loan_status,
      mev_status: row.mev_status,
      client_type: row.client_type,
      address: row.address,
      tell: row.tell,
      cell: row.cell,
      date_opened: row.date_opened,
      birth_date: row.birth_date,
      has_voted: row.has_voted,
      control_number: row.control_number,
      deleted_at: row.deleted_at,
      deleted_by: row.deleted_by,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_by: row.updated_by,
      updated_at: row.updated_at,
    });
  }
}
