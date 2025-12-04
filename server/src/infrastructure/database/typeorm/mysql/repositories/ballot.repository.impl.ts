import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BallotRepository } from '@domains/repositories/ballot.repository';
import { BallotEntity } from '../entities/ballot.entity';
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
    const ballot = new Ballot({
      ballotNumber,
      delegateId,
      electionId,
      status: BALLOT_STATUS_CONSTANTS.ISSUED,
    });
    return manager.save(BallotEntity, ballot);
  }

  async submitBallot(
    ballotNumber: string,
    context: EntityManager,
  ): Promise<Ballot> {
    const ballot = await context.query(
      `UPDATE ballots SET status = ? WHERE ballotNumber = ?`,
      [BALLOT_STATUS_CONSTANTS.SUBMITTED, ballotNumber],
    );
    return ballot;
  }

  async unlinkBallot(
    electionId: number,
    context: EntityManager,
  ): Promise<Ballot> {
    const ballot = await context.query(
      `UPDATE ballots SET delegateId = null WHERE electionId = ?`,
      [electionId],
    );
    return ballot;
  }

  async retrieveDelegateBallot(
    delegateId: number,
    context: EntityManager,
  ): Promise<Ballot> {
    const ballot = await context.query(
      `SELECT * FROM ballots WHERE delegateId = ? limit 1`,
      [delegateId],
    );
    return ballot[0];
  }
}
