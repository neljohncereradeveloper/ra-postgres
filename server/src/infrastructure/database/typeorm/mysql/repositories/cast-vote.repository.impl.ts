import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CastVoteRepository } from '@domains/repositories/cast-vote.repository';
import { CastVote } from '@domain/models/cast-vote.model';

@Injectable()
export class CastVoteRepositoryImpl
  implements CastVoteRepository<EntityManager>
{
  constructor() {}

  async castVote(
    castVote: CastVote,
    context: EntityManager,
  ): Promise<CastVote> {
    try {
      const resultVote = await context.query(
        `INSERT INTO cast_votes (electionId, ballotNumber, precinct, candidateId, positionId, districtId, dateTimeCast) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          castVote.electionId,
          castVote.ballotNumber,
          castVote.precinct,
          castVote.candidateId,
          castVote.positionId,
          castVote.districtId,
          castVote.dateTimeCast,
        ],
      );
      return resultVote;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Duplicate vote');
      }
      throw error;
    }
  }

  async reprintCastVoteWithElectionId(
    electionId: number,
    ballotNumber: string,
    context: EntityManager,
  ): Promise<CastVote> {
    try {
      const resultVote = await context.query(
        `
          SELECT
            cv.id,
            cv.precinct,
            c.displayName AS candidateName,
            p.desc1 AS positionName
          FROM cast_votes cv
          JOIN candidates c ON cv.candidateId = c.id
          JOIN positions p ON cv.positionId = p.id
          WHERE 
            cv.ballotNumber = ? AND cv.electionId = ?
        `,
        [ballotNumber, electionId],
      );
      return resultVote;
    } catch (error) {
      throw error;
    }
  }
}
