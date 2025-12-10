import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CastVoteRepository } from '@domains/repositories/cast-vote.repository';
import { CastVote } from '@domain/models/cast-vote.model';
import { getFirstRow } from '@shared/utils/query-result.util';

@Injectable()
export class CastVoteRepositoryImpl
  implements CastVoteRepository<EntityManager>
{
  constructor() {}

  async castVote(
    cast_vote: CastVote,
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
          datetime_cast
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await context.query(query, [
        cast_vote.election_id,
        cast_vote.ballot_number,
        cast_vote.precinct,
        cast_vote.candidate_id,
        cast_vote.position_id,
        cast_vote.district_id,
        cast_vote.datetime_cast,
      ]);

      const row = getFirstRow(result);
      if (!row) {
        return null;
      }
      return this.rowToModel(row);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Duplicate vote');
      }
      throw error;
    }
  }

  async reprintCastVote(
    election_id: number,
    ballot_number: string,
    context: EntityManager,
  ): Promise<CastVote> {
    try {
      const query = `
        SELECT
          cv.id,
          cv.election_id,
          cv.ballot_number,
          cv.precinct,
          cv.candidate_id,
          cv.position_id,
          cv.district_id,
          cv.datetime_cast,
          cv.deletedat,
        FROM cast_votes cv
        WHERE cv.ballot_number = $1 AND cv.election_id = $2
        LIMIT 1
      `;

      const result = await context.query(query, [ballot_number, election_id]);
      const row = getFirstRow(result);
      if (!row) {
        return null;
      }

      return this.rowToModel(row);
    } catch (error) {
      throw error;
    }
  }

  // Helper: Convert raw query result to domain model
  private rowToModel(row: any): CastVote {
    return new CastVote({
      id: row.id,
      election_id: row.election_id,
      ballot_number: row.ballot_number,
      precinct: row.precinct,
      candidate_id: row.candidate_id,
      position_id: row.position_id,
      district_id: row.district_id,
      datetime_cast: row.datetime_cast,
      deleted_at: row.deleted_at,
    });
  }
}
