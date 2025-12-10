import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Delegate } from '@domain/models/delegate.model';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import {
  getInsertId,
  getFirstRow,
  hasAffectedRows,
  extractRows,
} from '@shared/utils/query-result.util';

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
        RETURNING *
      `;

      const result = await manager.query(query, [
        delegate.electionid,
        delegate.branch,
        delegate.accountid,
        delegate.accountname,
        delegate.age || null,
        delegate.birthdate || null,
        delegate.address || null,
        delegate.tell || null,
        delegate.cell || null,
        delegate.dateopened || null,
        delegate.clienttype || null,
        delegate.loanstatus,
        delegate.balance,
        delegate.mevstatus,
        delegate.hasvoted || false,
        delegate.controlnumber,
        delegate.createdby || null,
        delegate.createdat || new Date(),
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

      if (updateFields.accountid !== undefined) {
        updateParts.push(`accountid = $${paramIndex++}`);
        values.push(updateFields.accountid);
      }

      if (updateFields.accountname !== undefined) {
        updateParts.push(`accountname = $${paramIndex++}`);
        values.push(updateFields.accountname);
      }

      if (updateFields.age !== undefined) {
        updateParts.push(`age = $${paramIndex++}`);
        values.push(updateFields.age);
      }

      if (updateFields.birthdate !== undefined) {
        updateParts.push(`birthdate = $${paramIndex++}`);
        values.push(updateFields.birthdate);
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

      if (updateFields.dateopened !== undefined) {
        updateParts.push(`dateopened = $${paramIndex++}`);
        values.push(updateFields.dateopened);
      }

      if (updateFields.clienttype !== undefined) {
        updateParts.push(`clienttype = $${paramIndex++}`);
        values.push(updateFields.clienttype);
      }

      if (updateFields.balance !== undefined) {
        updateParts.push(`balance = $${paramIndex++}`);
        values.push(updateFields.balance);
      }

      if (updateFields.loanstatus !== undefined) {
        updateParts.push(`loanstatus = $${paramIndex++}`);
        values.push(updateFields.loanstatus);
      }

      if (updateFields.mevstatus !== undefined) {
        updateParts.push(`mevstatus = $${paramIndex++}`);
        values.push(updateFields.mevstatus);
      }

      if (updateFields.hasvoted !== undefined) {
        updateParts.push(`hasvoted = $${paramIndex++}`);
        values.push(updateFields.hasvoted);
      }

      if (updateFields.controlnumber !== undefined) {
        updateParts.push(`controlnumber = $${paramIndex++}`);
        values.push(updateFields.controlnumber);
      }

      if (updateFields.updatedby !== undefined) {
        updateParts.push(`updatedby = $${paramIndex++}`);
        values.push(updateFields.updatedby);
      }

      if (updateFields.updatedat !== undefined) {
        updateParts.push(`updatedat = $${paramIndex++}`);
        values.push(updateFields.updatedat);
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
        d.id,
        d.branch,
        d.accountid,
        d.accountname,
        d.age,
        d.birthdate,
        d.address,
        d.tell,
        d.cell,
        d.dateopened,
        d.clienttype,
        d.balance,
        d.loanstatus,
        d.mevstatus,
        d.deletedat,
        d.electionid,
        e.name,
        d.hasvoted,
        d.controlnumber,
      FROM delegates d
      INNER JOIN elections e ON d.electionid = e.id
      WHERE ${whereClause}
      ORDER BY d.accountname ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    // Build count query
    const countQuery = `
      SELECT COUNT(d.id) AS "totalRecords"
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

  async findById(id: number, manager: EntityManager): Promise<Delegate | null> {
    const query = `
      SELECT 
        id,
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
        deletedby,
        deletedat,
        createdby,
        createdat,
        updatedby,
        updatedat,
      FROM delegates
      WHERE id = $1 AND deletedat IS NULL
    `;

    const result = await manager.query(query, [id]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async findByControlNumberAndElectionId(
    controlNumber: string,
    electionId: number,
    manager: EntityManager,
  ): Promise<Delegate> {
    const query = `
      SELECT 
        id,
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
        deletedby,
        deletedat,
        createdby,
        createdat,
        updatedby,
        updatedat,
      FROM delegates
      WHERE controlnumber = $1 AND electionid = $2 AND deletedat IS NULL
      LIMIT 1
    `;

    const result = await manager.query(query, [controlNumber, electionId]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async countByElection(
    electionId: number,
    manager: EntityManager,
  ): Promise<number> {
    const countQuery = `
      SELECT COUNT(id) AS "count"
      FROM delegates
      WHERE deletedat IS NULL
      AND electionid = $1
    `;

    const result = await manager.query(countQuery, [electionId]);
    const row = getFirstRow(result);
    return parseInt(row?.count || '0', 10);
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
      electionid: row.electionid,
      accountid: row.accountid,
      accountname: row.accountname,
      age: row.age,
      balance: row.balance,
      loanstatus: row.loanstatus,
      mevstatus: row.mevstatus,
      clienttype: row.clienttype,
      address: row.address,
      tell: row.tell,
      cell: row.cell,
      dateopened: row.dateopened,
      birthdate: row.birthdate,
      hasvoted: row.hasvoted,
      controlnumber: row.controlnumber,
      deletedat: row.deletedat,
      deletedby: row.deletedby,
      createdby: row.createdby,
      createdat: row.createdat,
      updatedby: row.updatedby,
      updatedat: row.updatedat,
    });
  }
}
