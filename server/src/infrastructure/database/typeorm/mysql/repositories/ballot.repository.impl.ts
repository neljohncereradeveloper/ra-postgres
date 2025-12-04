import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BallotRepository } from '@domains/repositories/ballot.repository';
import { Ballot } from '@domain/models/ballot.model';
import { BALLOT_STATUS_CONSTANTS } from '@domain/constants/ballot/ballot-actions.constants';

@Injectable()
export class BallotRepositoryImpl implements BallotRepository<EntityManager> {
  constructor() {}

  async issueBallot(
    ballotNumber: string,
    delegateId: number,
    electionId: number,
    manager: EntityManager,
  ): Promise<Ballot> {
    const query = `
      INSERT INTO ballots (ballotnumber, delegateid, electionid, ballotstatus)
      VALUES ($1, $2, $3, $4)
    `;

    const result = await manager.query(query, [
      ballotNumber,
      delegateId,
      electionId,
      BALLOT_STATUS_CONSTANTS.ISSUED,
    ]);

    // Get the inserted row
    const insertId = result.insertId;
    const selectQuery = `
      SELECT 
        id,
        ballotnumber as ballotnumber,
        delegateid as delegateid,
        electionid as electionid,
        ballotstatus as ballotstatus
      FROM ballots
      WHERE id = $1
    `;

    const rows = await manager.query(selectQuery, [insertId]);
    return this.rowToModel(rows[0]);
  }

  async submitBallot(
    ballotNumber: string,
    context: EntityManager,
  ): Promise<Ballot> {
    // Update the ballot status
    await context.query(
      `UPDATE ballots SET ballotstatus = $1 WHERE ballotnumber = $2`,
      [BALLOT_STATUS_CONSTANTS.SUBMITTED, ballotNumber],
    );

    // Retrieve the updated ballot
    const selectQuery = `
      SELECT 
        id,
        ballotnumber as ballotnumber,
        delegateid as delegateid,
        electionid as electionid,
        ballotstatus as ballotstatus
      FROM ballots
      WHERE ballotnumber = $1
      LIMIT 1
    `;

    const rows = await context.query(selectQuery, [ballotNumber]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  async unlinkBallot(
    electionId: number,
    context: EntityManager,
  ): Promise<Ballot> {
    // Update ballots to unlink delegate
    await context.query(
      `UPDATE ballots SET delegateid = NULL WHERE electionid = $1`,
      [electionId],
    );

    // Retrieve the first updated ballot (if any)
    const selectQuery = `
      SELECT 
        id,
        ballotnumber as ballotnumber,
        delegateid as delegateid,
        electionid as electionid,
        ballotstatus as ballotstatus
      FROM ballots
      WHERE electionid = $1 AND delegateid IS NULL
      LIMIT 1
    `;

    const rows = await context.query(selectQuery, [electionId]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  async retrieveDelegateBallot(
    delegateId: number,
    context: EntityManager,
  ): Promise<Ballot> {
    const query = `
      SELECT 
        id,
        ballotnumber as ballotnumber,
        delegateid as delegateid,
        electionid as electionid,
        ballotstatus as ballotstatus
      FROM ballots
      WHERE delegateid = $1
      LIMIT 1
    `;

    const rows = await context.query(query, [delegateId]);
    if (rows.length === 0) {
      return null;
    }

    return this.rowToModel(rows[0]);
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): Ballot {
    return new Ballot({
      id: row.id,
      ballotNumber: row.ballotnumber,
      delegateId: row.delegateid,
      electionId: row.electionid,
      ballotStatus: row.ballotstatus,
    });
  }
}
