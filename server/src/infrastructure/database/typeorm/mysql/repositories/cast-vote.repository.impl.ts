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
      const query = `
        INSERT INTO cast_votes (
          election_id,
          ballot_number,
          precinct,
          candidate_id,
          position_id,
          district_id,
          date_time_cast
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await context.query(query, [
        castVote.electionId,
        castVote.ballotNumber,
        castVote.precinct,
        castVote.candidateId,
        castVote.positionId,
        castVote.districtId,
        castVote.dateTimeCast,
      ]);

      // Get the inserted row
      const insertId = result.insertId;
      const selectQuery = `
        SELECT 
          id,
          election_id as electionId,
          ballot_number as ballotNumber,
          precinct,
          candidate_id as candidateId,
          position_id as positionId,
          district_id as districtId,
          date_time_cast as dateTimeCast,
          deleted_at as deletedAt
        FROM cast_votes
        WHERE id = ?
      `;

      const rows = await context.query(selectQuery, [insertId]);
      return this.rowToModel(rows[0]);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Duplicate vote');
      }
      throw error;
    }
  }

  async reprintCastVote(
    electionId: number,
    ballotNumber: string,
    context: EntityManager,
  ): Promise<CastVote> {
    try {
      const query = `
        SELECT
          cv.id,
          cv.election_id as electionId,
          cv.ballot_number as ballotNumber,
          cv.precinct,
          cv.candidate_id as candidateId,
          cv.position_id as positionId,
          cv.district_id as districtId,
          cv.date_time_cast as dateTimeCast,
          cv.deleted_at as deletedAt
        FROM cast_votes cv
        WHERE cv.ballot_number = ? AND cv.election_id = ?
        LIMIT 1
      `;

      const rows = await context.query(query, [ballotNumber, electionId]);
      if (rows.length === 0) {
        return null;
      }

      return this.rowToModel(rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): CastVote {
    return new CastVote({
      id: row.id,
      electionId: row.electionId,
      ballotNumber: row.ballotNumber,
      precinct: row.precinct,
      candidateId: row.candidateId,
      positionId: row.positionId,
      districtId: row.districtId,
      dateTimeCast: row.dateTimeCast,
      deletedAt: row.deletedAt,
    });
  }
}
