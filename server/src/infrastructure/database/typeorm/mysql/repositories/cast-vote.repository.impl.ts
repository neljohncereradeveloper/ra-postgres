import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CastVoteRepository } from '@domains/repositories/cast-vote.repository';
import { CastVote } from '@domain/models/cast-vote.model';
import { getInsertId, getFirstRow } from '@shared/utils/query-result.util';

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
          electionid,
          ballotnumber,
          precinct,
          candidateid,
          positionid,
          districtid,
          datetimecast
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
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
    electionId: number,
    ballotNumber: string,
    context: EntityManager,
  ): Promise<CastVote> {
    try {
      const query = `
        SELECT
          cv.id,
          cv.electionid as electionid,
          cv.ballotnumber as ballotnumber,
          cv.precinct,
          cv.candidateid as candidateid,
          cv.positionid as positionid,
          cv.districtid as districtid,
          cv.datetimecast as datetimecast,
          cv.deletedat as deletedat
        FROM cast_votes cv
        WHERE cv.ballotnumber = $1 AND cv.electionid = $2
        LIMIT 1
      `;

      const result = await context.query(query, [ballotNumber, electionId]);
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
      electionId: row.electionid,
      ballotNumber: row.ballotnumber,
      precinct: row.precinct,
      candidateId: row.candidateid,
      positionId: row.positionid,
      districtId: row.districtid,
      dateTimeCast: row.datetimecast,
      deletedAt: row.deletedat,
    });
  }
}
