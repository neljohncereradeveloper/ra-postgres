import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Delegate } from '@domain/models/delegate.model';
import { DelegateRepository } from '@domains/repositories/delegate.repository';

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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await manager.query(query, [
        delegate.electionId,
        delegate.branch,
        delegate.accountId,
        delegate.accountName,
        delegate.age || null,
        delegate.birthDate || null,
        delegate.address || null,
        delegate.tell || null,
        delegate.cell || null,
        delegate.dateOpened || null,
        delegate.clientType || null,
        delegate.loanStatus,
        delegate.balance,
        delegate.mevStatus,
        delegate.hasVoted || false,
        delegate.controlNumber,
        delegate.createdBy || null,
        delegate.createdAt || new Date(),
      ]);

      // Get the inserted row
      const insertId = result.insertId;
      const selectQuery = `
        SELECT 
          id,
          election_id as electionId,
          branch,
          account_id as accountId,
          account_name as accountName,
          age,
          birth_date as birthDate,
          address,
          tell,
          cell,
          date_opened as dateOpened,
          client_type as clientType,
          loan_status as loanStatus,
          balance,
          mev_status as mevStatus,
          has_voted as hasVoted,
          control_number as controlNumber,
          deleted_by as deletedBy,
          deleted_at as deletedAt,
          created_by as createdBy,
          created_at as createdAt,
          updated_by as updatedBy,
          updated_at as updatedAt
        FROM delegates
        WHERE id = ?
      `;

      const rows = await manager.query(selectQuery, [insertId]);
      return this.rowToModel(rows[0]);
    } catch (error) {
      console.log('error', error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(error.sqlMessage);
      }
      throw error;
    }
  }

  async update(
    id: number,
    updateFields: Partial<Delegate>,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const updateParts: string[] = [];
      const values: any[] = [];

      if (updateFields.branch !== undefined) {
        updateParts.push('branch = ?');
        values.push(updateFields.branch);
      }

      if (updateFields.accountId !== undefined) {
        updateParts.push('account_id = ?');
        values.push(updateFields.accountId);
      }

      if (updateFields.accountName !== undefined) {
        updateParts.push('account_name = ?');
        values.push(updateFields.accountName);
      }

      if (updateFields.age !== undefined) {
        updateParts.push('age = ?');
        values.push(updateFields.age);
      }

      if (updateFields.birthDate !== undefined) {
        updateParts.push('birth_date = ?');
        values.push(updateFields.birthDate);
      }

      if (updateFields.address !== undefined) {
        updateParts.push('address = ?');
        values.push(updateFields.address);
      }

      if (updateFields.tell !== undefined) {
        updateParts.push('tell = ?');
        values.push(updateFields.tell);
      }

      if (updateFields.cell !== undefined) {
        updateParts.push('cell = ?');
        values.push(updateFields.cell);
      }

      if (updateFields.dateOpened !== undefined) {
        updateParts.push('date_opened = ?');
        values.push(updateFields.dateOpened);
      }

      if (updateFields.clientType !== undefined) {
        updateParts.push('client_type = ?');
        values.push(updateFields.clientType);
      }

      if (updateFields.balance !== undefined) {
        updateParts.push('balance = ?');
        values.push(updateFields.balance);
      }

      if (updateFields.loanStatus !== undefined) {
        updateParts.push('loan_status = ?');
        values.push(updateFields.loanStatus);
      }

      if (updateFields.mevStatus !== undefined) {
        updateParts.push('mev_status = ?');
        values.push(updateFields.mevStatus);
      }

      if (updateFields.hasVoted !== undefined) {
        updateParts.push('has_voted = ?');
        values.push(updateFields.hasVoted);
      }

      if (updateFields.controlNumber !== undefined) {
        updateParts.push('control_number = ?');
        values.push(updateFields.controlNumber);
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
        UPDATE delegates
        SET ${updateParts.join(', ')}
        WHERE id = ? AND deleted_at IS NULL
      `;

      const result = await manager.query(query, values);
      return result.affectedRows && result.affectedRows > 0;
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
    isDeleted: boolean,
    electionId: number,
    manager: EntityManager,
  ): Promise<{
    data: Delegate[];
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

    // Build WHERE conditions
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    // Filter by deletion status
    if (isDeleted) {
      whereConditions.push('d.deleted_at IS NOT NULL');
    } else {
      whereConditions.push('d.deleted_at IS NULL');
    }

    // Filter by election ID
    whereConditions.push('d.election_id = ?');
    queryParams.push(electionId);

    // Apply search filter on account name
    if (term) {
      whereConditions.push('LOWER(d.account_name) LIKE ?');
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Build data query
    const dataQuery = `
      SELECT 
        d.id AS id,
        d.branch AS branch,
        d.account_id AS accountId,
        d.account_name AS accountName,
        d.age AS age,
        d.birth_date AS birthDate,
        d.address AS address,
        d.tell AS tell,
        d.cell AS cell,
        d.date_opened AS dateOpened,
        d.client_type AS clientType,
        d.balance AS balance,
        d.loan_status AS loanStatus,
        d.mev_status AS mevStatus,
        d.deleted_at AS deletedAt,
        d.election_id AS electionId,
        e.name AS election,
        d.has_voted AS hasVoted,
        d.control_number AS controlNumber
      FROM delegates d
      INNER JOIN elections e ON d.election_id = e.id
      WHERE ${whereClause}
      ORDER BY d.account_name ASC
      LIMIT ? OFFSET ?
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(d.id) AS totalRecords
      FROM delegates d
      INNER JOIN elections e ON d.election_id = e.id
      WHERE ${whereClause}
    `;

    // Execute both queries simultaneously
    const [dataRows, countResult] = await Promise.all([
      manager.query(dataQuery, [...queryParams, limit, skip]),
      manager.query(countQuery, queryParams),
    ]);

    // Extract total records
    const totalRecords = parseInt(countResult[0]?.totalRecords || '0', 10);

    // Map raw results to domain models
    const data = dataRows.map((row: any) => this.rowToModel(row));

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

  async findById(id: number, manager: EntityManager): Promise<Delegate | null> {
    const query = `
      SELECT 
        id,
        election_id as electionId,
        branch,
        account_id as accountId,
        account_name as accountName,
        age,
        birth_date as birthDate,
        address,
        tell,
        cell,
        date_opened as dateOpened,
        client_type as clientType,
        loan_status as loanStatus,
        balance,
        mev_status as mevStatus,
        has_voted as hasVoted,
        control_number as controlNumber,
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM delegates
      WHERE id = ? AND deleted_at IS NULL
    `;

    const rows = await manager.query(query, [id]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  async findByControlNumberAndElectionId(
    controlNumber: string,
    electionId: number,
    manager: EntityManager,
  ): Promise<Delegate> {
    const query = `
      SELECT 
        id,
        election_id as electionId,
        branch,
        account_id as accountId,
        account_name as accountName,
        age,
        birth_date as birthDate,
        address,
        tell,
        cell,
        date_opened as dateOpened,
        client_type as clientType,
        loan_status as loanStatus,
        balance,
        mev_status as mevStatus,
        has_voted as hasVoted,
        control_number as controlNumber,
        deleted_by as deletedBy,
        deleted_at as deletedAt,
        created_by as createdBy,
        created_at as createdAt,
        updated_by as updatedBy,
        updated_at as updatedAt
      FROM delegates
      WHERE control_number = ? AND election_id = ? AND deleted_at IS NULL
      LIMIT 1
    `;

    const rows = await manager.query(query, [controlNumber, electionId]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  async countByElection(
    electionId: number,
    manager: EntityManager,
  ): Promise<number> {
    const countQuery = `
      SELECT COUNT(id) AS count
      FROM delegates
      WHERE deleted_at IS NULL
      AND election_id = ?
    `;

    const result = await manager.query(countQuery, [electionId]);
    return parseInt(result[0]?.count || '0', 10);
  }

  async markAsVoted(delegateId: number, manager: EntityManager): Promise<void> {
    const query = `
      UPDATE delegates
      SET has_voted = ?
      WHERE id = ?
    `;

    await manager.query(query, [true, delegateId]);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): Delegate {
    return new Delegate({
      id: row.id,
      branch: row.branch,
      electionId: row.electionId,
      accountId: row.accountId,
      accountName: row.accountName,
      age: row.age,
      balance: row.balance,
      loanStatus: row.loanStatus,
      mevStatus: row.mevStatus,
      clientType: row.clientType,
      address: row.address,
      tell: row.tell,
      cell: row.cell,
      dateOpened: row.dateOpened,
      birthDate: row.birthDate,
      hasVoted: row.hasVoted,
      controlNumber: row.controlNumber,
      deletedAt: row.deletedAt,
      deletedBy: row.deletedBy,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedBy: row.updatedBy,
      updatedAt: row.updatedAt,
    });
  }
}
