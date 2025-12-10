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
        castVote.electionid,
        castVote.ballotnumber,
        castVote.precinct,
        castVote.candidateid,
        castVote.positionid,
        castVote.districtid,
        castVote.datetimecast,
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
    electionid: number,
    ballotnumber: string,
    context: EntityManager,
  ): Promise<CastVote> {
    try {
      const query = `
        SELECT
          cv.id,
          cv.electionid,
          cv.ballotnumber,
          cv.precinct,
          cv.candidateid,
          cv.positionid,
          cv.districtid,
          cv.datetimecast,
          cv.deletedat,
        FROM cast_votes cv
        WHERE cv.ballotnumber = $1 AND cv.electionid = $2
        LIMIT 1
      `;

      const result = await context.query(query, [ballotnumber, electionid]);
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
      electionid: row.electionid,
      ballotnumber: row.ballotnumber,
      precinct: row.precinct,
      candidateid: row.candidateid,
      positionid: row.positionid,
      districtid: row.districtid,
      datetimecast: row.datetimecast,
      deletedat: row.deletedat,
    });
  }
}
