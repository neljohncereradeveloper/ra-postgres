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
    ballot_number: string,
    delegate_id: number,
    election_id: number,
    manager: EntityManager,
  ): Promise<Ballot> {
    const query = `
      INSERT INTO ballots (ballot_number, delegate_id, election_id, ballot_status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await manager.query(query, [
      ballot_number,
      delegate_id,
      election_id,
      BALLOT_STATUS_CONSTANTS.ISSUED,
    ]);

    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async submitBallot(
    ballot_number: string,
    context: EntityManager,
  ): Promise<Ballot> {
    // Update the ballot status
    await context.query(
      `UPDATE ballots SET ballot_status = $1 WHERE ballot_number = $2`,
      [BALLOT_STATUS_CONSTANTS.SUBMITTED, ballot_number],
    );

    // Retrieve the updated ballot
    const selectQuery = `
      SELECT 
        id,
        ballot_number,
        delegate_id,
        election_id,
        ballot_status
      FROM ballots
      WHERE ballot_number = $1
      LIMIT 1
    `;

    const result = await context.query(selectQuery, [ballot_number]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async unlinkBallot(
    election_id: number,
    context: EntityManager,
  ): Promise<Ballot> {
    // Update ballots to unlink delegate
    await context.query(
      `UPDATE ballots SET delegate_id = NULL WHERE election_id = $1`,
      [election_id],
    );

    // Retrieve the first updated ballot (if any)
    const selectQuery = `
      SELECT 
        id,
        ballot_number,
        delegate_id,
        election_id,
        ballot_status
      FROM ballots
      WHERE election_id = $1 AND delegate_id IS NULL AND deleted_at IS NULL
      LIMIT 1
    `;

    const result = await context.query(selectQuery, [election_id]);
    const row = getFirstRow(result);
    if (!row) {
      return null;
    }

    return this.rowToModel(row);
  }

  async retrieveDelegateBallot(
    delegate_id: number,
    context: EntityManager,
  ): Promise<Ballot> {
    const query = `
      SELECT 
        id,
        ballot_number,
        delegate_id,
        election_id,
        ballot_status
      FROM ballots
      WHERE delegate_id = $1
      LIMIT 1
    `;

    const result = await context.query(query, [delegate_id]);
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
      ballot_number: row.ballot_number,
      delegate_id: row.delegate_id,
      election_id: row.election_id,
      ballot_status: row.ballot_status,
    });
  }
}
