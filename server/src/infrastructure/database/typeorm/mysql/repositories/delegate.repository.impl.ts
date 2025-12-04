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
          electionid,
          branch,
          accountid,
          accountname,
          age,
          birthdate,
          address,
          tell,
          cell,
          dateopened,
          clienttype,
          loanstatus,
          balance,
          mevstatus,
          hasvoted,
          controlnumber,
          createdby,
          createdat
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
          electionid as electionid,
          branch,
          accountid as accountid,
          accountname as accountname,
          age,
          birthdate as birthdate,
          address,
          tell,
          cell,
          dateopened as dateopened,
          clienttype as clienttype,
          loanstatus as loanstatus,
          balance,
          mevstatus as mevstatus,
          hasvoted as hasvoted,
          controlnumber as controlnumber,
          deletedby as deletedby,
          deletedat as deletedat,
          createdby as createdby,
          createdat as createdat,
          updatedby as updatedby,
          updatedat as updatedat
        FROM delegates
        WHERE id = $1
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
      let paramIndex = 1;

      if (updateFields.branch !== undefined) {
        updateParts.push(`branch = $${paramIndex++}`);
        values.push(updateFields.branch);
      }

      if (updateFields.accountId !== undefined) {
        updateParts.push(`accountid = $${paramIndex++}`);
        values.push(updateFields.accountId);
      }

      if (updateFields.accountName !== undefined) {
        updateParts.push(`accountname = $${paramIndex++}`);
        values.push(updateFields.accountName);
      }

      if (updateFields.age !== undefined) {
        updateParts.push(`age = $${paramIndex++}`);
        values.push(updateFields.age);
      }

      if (updateFields.birthDate !== undefined) {
        updateParts.push(`birthdate = $${paramIndex++}`);
        values.push(updateFields.birthDate);
      }

      if (updateFields.address !== undefined) {
        updateParts.push(`address = $${paramIndex++}`);
        values.push(updateFields.address);
      }

      if (updateFields.tell !== undefined) {
        updateParts.push(`tell = $${paramIndex++}`);
        values.push(updateFields.tell);
      }

      if (updateFields.cell !== undefined) {
        updateParts.push(`cell = $${paramIndex++}`);
        values.push(updateFields.cell);
      }

      if (updateFields.dateOpened !== undefined) {
        updateParts.push(`dateopened = $${paramIndex++}`);
        values.push(updateFields.dateOpened);
      }

      if (updateFields.clientType !== undefined) {
        updateParts.push(`clienttype = $${paramIndex++}`);
        values.push(updateFields.clientType);
      }

      if (updateFields.balance !== undefined) {
        updateParts.push(`balance = $${paramIndex++}`);
        values.push(updateFields.balance);
      }

      if (updateFields.loanStatus !== undefined) {
        updateParts.push(`loanstatus = $${paramIndex++}`);
        values.push(updateFields.loanStatus);
      }

      if (updateFields.mevStatus !== undefined) {
        updateParts.push(`mevstatus = $${paramIndex++}`);
        values.push(updateFields.mevStatus);
      }

      if (updateFields.hasVoted !== undefined) {
        updateParts.push(`hasvoted = $${paramIndex++}`);
        values.push(updateFields.hasVoted);
      }

      if (updateFields.controlNumber !== undefined) {
        updateParts.push(`controlnumber = $${paramIndex++}`);
        values.push(updateFields.controlNumber);
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
        UPDATE delegates
        SET ${updateParts.join(', ')}
        WHERE id = $${paramIndex} AND deletedat IS NULL
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
      whereConditions.push('d.deletedat IS NOT NULL');
    } else {
      whereConditions.push('d.deletedat IS NULL');
    }

    // Filter by election ID
    let paramIndex = 1;
    whereConditions.push(`d.electionid = $${paramIndex++}`);
    queryParams.push(electionId);

    // Apply search filter on account name
    if (term) {
      whereConditions.push(`LOWER(d.accountname) LIKE $${paramIndex++}`);
      queryParams.push(`%${term.toLowerCase()}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Build data query
    const dataQuery = `
      SELECT 
        d.id AS id,
        d.branch AS branch,
        d.accountid AS accountid,
        d.accountname AS accountname,
        d.age AS age,
        d.birthdate AS birthdate,
        d.address AS address,
        d.tell AS tell,
        d.cell AS cell,
        d.dateopened AS dateopened,
        d.clienttype AS clienttype,
        d.balance AS balance,
        d.loanstatus AS loanstatus,
        d.mevstatus AS mevstatus,
        d.deletedat AS deletedat,
        d.electionid AS electionid,
        e.name AS election,
        d.hasvoted AS hasvoted,
        d.controlnumber AS controlnumber
      FROM delegates d
      INNER JOIN elections e ON d.electionid = e.id
      WHERE ${whereClause}
      ORDER BY d.accountname ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(d.id) AS totalRecords
      FROM delegates d
      INNER JOIN elections e ON d.electionid = e.id
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
        electionid as electionid,
        branch,
        accountid as accountid,
        accountname as accountname,
        age,
        birthdate as birthdate,
        address,
        tell,
        cell,
        dateopened as dateopened,
        clienttype as clienttype,
        loanstatus as loanstatus,
        balance,
        mevstatus as mevstatus,
        hasvoted as hasvoted,
        controlnumber as controlnumber,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM delegates
      WHERE id = $1 AND deletedat IS NULL
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
        electionid as electionid,
        branch,
        accountid as accountid,
        accountname as accountname,
        age,
        birthdate as birthdate,
        address,
        tell,
        cell,
        dateopened as dateopened,
        clienttype as clienttype,
        loanstatus as loanstatus,
        balance,
        mevstatus as mevstatus,
        hasvoted as hasvoted,
        controlnumber as controlnumber,
        deletedby as deletedby,
        deletedat as deletedat,
        createdby as createdby,
        createdat as createdat,
        updatedby as updatedby,
        updatedat as updatedat
      FROM delegates
      WHERE controlnumber = $1 AND electionid = $2 AND deletedat IS NULL
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
      WHERE deletedat IS NULL
      AND electionid = $1
    `;

    const result = await manager.query(countQuery, [electionId]);
    return parseInt(result[0]?.count || '0', 10);
  }

  async markAsVoted(delegateId: number, manager: EntityManager): Promise<void> {
    const query = `
      UPDATE delegates
      SET hasvoted = $1
      WHERE id = $2
    `;

    await manager.query(query, [true, delegateId]);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): Delegate {
    return new Delegate({
      id: row.id,
      branch: row.branch,
      electionId: row.electionid,
      accountId: row.accountid,
      accountName: row.accountname,
      age: row.age,
      balance: row.balance,
      loanStatus: row.loanstatus,
      mevStatus: row.mevstatus,
      clientType: row.clienttype,
      address: row.address,
      tell: row.tell,
      cell: row.cell,
      dateOpened: row.dateopened,
      birthDate: row.birthdate,
      hasVoted: row.hasvoted,
      controlNumber: row.controlnumber,
      deletedAt: row.deletedat,
      deletedBy: row.deletedby,
      createdBy: row.createdby,
      createdAt: row.createdat,
      updatedBy: row.updatedby,
      updatedAt: row.updatedat,
    });
  }
}
