import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BallotRepository } from '@domains/repositories/ballot.repository';
import { Ballot } from '@domain/models/ballot.model';
import { BALLOT_STATUS_CONSTANTS } from '@domain/constants/ballot/ballot-actions.constants';
import { getInsertId, getFirstRow } from '@shared/utils/query-result.util';

@Injectable()
export class BallotRepositoryImpl implements BallotRepository<EntityManager> {
  constructor() {}

  async issueBallot(
    ballotnumber: string,
    delegateid: number,
    electionid: number,
    manager: EntityManager,
  ): Promise<Ballot> {
    const query = `
      INSERT INTO ballots (ballotnumber, delegateid, electionid, ballotstatus)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await manager.query(query, [
      ballotnumber,
      delegateid,
      electionid,
      BALLOT_STATUS_CONSTANTS.ISSUED,
    ]);

    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async submitBallot(
    ballotnumber: string,
    context: EntityManager,
  ): Promise<Ballot> {
    // Update the ballot status
    await context.query(
      `UPDATE ballots SET ballotstatus = $1 WHERE ballotnumber = $2`,
      [BALLOT_STATUS_CONSTANTS.SUBMITTED, ballotnumber],
    );

    // Retrieve the updated ballot
    const selectQuery = `
      SELECT 
        id,
        ballotnumber,
        delegateid,
        electionid,
        ballotstatus
      FROM ballots
      WHERE ballotnumber = $1
      LIMIT 1
    `;

    const result = await context.query(selectQuery, [ballotnumber]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async unlinkBallot(
    electionid: number,
    context: EntityManager,
  ): Promise<Ballot> {
    // Update ballots to unlink delegate
    await context.query(
      `UPDATE ballots SET delegateid = NULL WHERE electionid = $1`,
      [electionid],
    );

    // Retrieve the first updated ballot (if any)
    const selectQuery = `
      SELECT 
        id,
        ballotnumber,
        delegateid,
        electionid,
        ballotstatus
      FROM ballots
      WHERE electionid = $1 AND delegateid IS NULL AND deletedat IS NULL
      LIMIT 1
    `;

    const result = await context.query(selectQuery, [electionid]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async retrieveDelegateBallot(
    delegateid: number,
    context: EntityManager,
  ): Promise<Ballot> {
    const query = `
      SELECT 
        id,
        ballotnumber,
        delegateid,
        electionid,
        ballotstatus
      FROM ballots
      WHERE delegateid = $1
      LIMIT 1
    `;

    const result = await context.query(query, [delegateid]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): Ballot {
    return new Ballot({
      id: row.id,
      ballotnumber: row.ballotnumber,
      delegateid: row.delegateid,
      electionid: row.electionid,
      ballotstatus: row.ballotstatus,
    });
  }
}
