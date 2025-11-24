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
            c.displayName AS candidate,
            COUNT(cv.id) AS voteCount
          FROM positions p
          JOIN candidates c ON c.positionId = p.id
          LEFT JOIN cast_votes cv
            ON cv.candidateId = c.id
            AND cv.positionId = p.id
            AND cv.electionId = ?
            AND cv.deletedAt IS NULL
          WHERE p.deletedAt IS NULL
            AND c.deletedAt IS NULL
            AND p.electionId = ?
            AND c.electionId = ?
          GROUP BY p.id, c.id
          ORDER BY p.id, voteCount DESC, c.displayName;
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
            c.displayName AS candidate
          FROM positions p
          JOIN candidates c ON c.positionId = p.id
          LEFT JOIN cast_votes cv
            ON cv.candidateId = c.id
            AND cv.positionId = p.id
            AND cv.electionId = ?
            AND cv.deletedAt IS NULL
          WHERE p.deletedAt IS NULL
            AND c.deletedAt IS NULL
            AND p.electionId = ?
            AND c.electionId = ?
          GROUP BY p.id, c.id
          ORDER BY p.id, c.displayName;
        `,
        [electionId, electionId, electionId],
      );
      return candidatesReport;
    } catch (error) {
      throw error;
    }
  }
}
