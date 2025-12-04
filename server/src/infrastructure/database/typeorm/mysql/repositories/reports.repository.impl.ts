import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ReportsRepository } from '@domains/repositories/reports.repository';

@Injectable()
export class ReportsRepositoryImpl implements ReportsRepository<EntityManager> {
  constructor() {}

  async electionCastVoteReport(
    electionId: number,
    context?: EntityManager,
  ): Promise<any> {
    try {
      const castVoteReport = await context.query(
        `
          SELECT
            p.desc1 AS position,
            c.displayname AS candidate,
            COUNT(cv.id) AS voteCount
          FROM positions p
          JOIN candidates c ON c.positionid = p.id
          LEFT JOIN cast_votes cv
            ON cv.candidateid = c.id
            AND cv.positionid = p.id
            AND cv.electionid = $1
            AND cv.deletedat IS NULL
          WHERE p.deletedat IS NULL
            AND c.deletedat IS NULL
            AND p.electionid = $2
            AND c.electionid = $3
          GROUP BY p.id, c.id
          ORDER BY p.id, voteCount DESC, c.displayname;
        `,
        [electionId, electionId, electionId],
      );
      return castVoteReport;
    } catch (error) {
      throw error;
    }
  }

  async electionCandidatesReport(
    electionId: number,
    context?: EntityManager,
  ): Promise<any> {
    try {
      const candidatesReport = await context.query(
        `
          SELECT
            p.desc1 AS position,
            c.displayname AS candidate
          FROM positions p
          JOIN candidates c ON c.positionid = p.id
          LEFT JOIN cast_votes cv
            ON cv.candidateid = c.id
            AND cv.positionid = p.id
            AND cv.electionid = $1
            AND cv.deletedat IS NULL
          WHERE p.deletedat IS NULL
            AND c.deletedat IS NULL
            AND p.electionid = $2
            AND c.electionid = $3
          GROUP BY p.id, c.id
          ORDER BY p.id, c.displayname;
        `,
        [electionId, electionId, electionId],
      );
      return candidatesReport;
    } catch (error) {
      throw error;
    }
  }
}
