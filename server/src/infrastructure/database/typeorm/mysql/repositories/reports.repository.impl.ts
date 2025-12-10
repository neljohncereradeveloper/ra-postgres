import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ReportsRepository } from '@domains/repositories/reports.repository';

@Injectable()
export class ReportsRepositoryImpl implements ReportsRepository<EntityManager> {
  constructor() {}

  async electionCastVoteReport(
    election_id: number,
    context?: EntityManager,
  ): Promise<any> {
    try {
      const castVoteReport = await context.query(
        `
          SELECT
            p.desc1 AS position,
            c.display_name AS candidate,
            COUNT(cv.id) AS vote_count
          FROM positions p
          JOIN candidates c ON c.position_id = p.id
          LEFT JOIN cast_votes cv
            ON cv.candidate_id = c.id
            AND cv.position_id = p.id
            AND cv.election_id = $1
            AND cv.deleted_at IS NULL
          WHERE p.deleted_at IS NULL
            AND c.deleted_at IS NULL
            AND p.election_id = $2
            AND c.election_id = $3
          GROUP BY p.id, c.id
          ORDER BY p.id, vote_count DESC, c.display_name;
        `,
        [election_id, election_id, election_id],
      );
      return castVoteReport;
    } catch (error) {
      throw error;
    }
  }

  async electionCandidatesReport(
    election_id: number,
    context?: EntityManager,
  ): Promise<any> {
    try {
      const candidatesReport = await context.query(
        `
          SELECT
            p.desc1 AS position,
            c.display_name AS candidate
          FROM positions p
          JOIN candidates c ON c.position_id = p.id
          LEFT JOIN cast_votes cv
            ON cv.candidate_id = c.id
            AND cv.position_id = p.id
            AND cv.election_id = $1
            AND cv.deleted_at IS NULL
          WHERE p.deleted_at IS NULL
            AND c.deleted_at IS NULL
            AND p.election_id = $2
            AND c.election_id = $3
          GROUP BY p.id, c.id
          ORDER BY p.id, c.display_name;
        `,
        [election_id, election_id, election_id],
      );
      return candidatesReport;
    } catch (error) {
      throw error;
    }
  }
}
