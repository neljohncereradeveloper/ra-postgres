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
      INSERT INTO ballots (ballot_number, delegate_id, election_id, ballot_status)
      VALUES (?, ?, ?, ?)
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
        ballot_number as ballotNumber,
        delegate_id as delegateId,
        election_id as electionId,
        ballot_status as ballotStatus
      FROM ballots
      WHERE id = ?
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
      `UPDATE ballots SET ballot_status = ? WHERE ballot_number = ?`,
      [BALLOT_STATUS_CONSTANTS.SUBMITTED, ballotNumber],
    );

    // Retrieve the updated ballot
    const selectQuery = `
      SELECT 
        id,
        ballot_number as ballotNumber,
        delegate_id as delegateId,
        election_id as electionId,
        ballot_status as ballotStatus
      FROM ballots
      WHERE ballot_number = ?
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
      `UPDATE ballots SET delegate_id = NULL WHERE election_id = ?`,
      [electionId],
    );

    // Retrieve the first updated ballot (if any)
    const selectQuery = `
      SELECT 
        id,
        ballot_number as ballotNumber,
        delegate_id as delegateId,
        election_id as electionId,
        ballot_status as ballotStatus
      FROM ballots
      WHERE election_id = ? AND delegate_id IS NULL
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
        ballot_number as ballotNumber,
        delegate_id as delegateId,
        election_id as electionId,
        ballot_status as ballotStatus
      FROM ballots
      WHERE delegate_id = ?
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
      ballotNumber: row.ballotNumber,
      delegateId: row.delegateId,
      electionId: row.electionId,
      ballotStatus: row.ballotStatus,
    });
  }
}
