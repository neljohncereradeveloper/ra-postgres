import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ActiveElection } from '@domain/models/active-election.model';
import { ACTIVE_ELECTION_ID } from '@domain/constants/active-election/active-election-actions.constants';

@Injectable()
export class ActiveElectionRepositoryImpl
  implements ActiveElectionRepository<EntityManager>
{
  async setActiveElection(
    electionId: number,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const result = await manager.query(
        `
        UPDATE active_election
        SET electionid = $1
        WHERE id = $2
        RETURNING *
        `,
        [electionId, ACTIVE_ELECTION_ID],
      );

      // Handle PostgreSQL result format: [rows, rowCount] or direct array
      // TypeORM may return the raw pg result or unwrap it
      let rows: any[];
      if (
        Array.isArray(result) &&
        result.length === 2 &&
        Array.isArray(result[0])
      ) {
        // Raw PostgreSQL driver format: [rows, rowCount]
        rows = result[0];
      } else if (Array.isArray(result)) {
        // TypeORM unwrapped format: array of rows
        rows = result;
      } else if (result && result.affectedRows !== undefined) {
        // MySQL format or TypeORM result object
        return result.affectedRows > 0;
      } else {
        rows = [];
      }

      return rows.length > 0;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Active election already exists');
      }
      throw error;
    }
  }

  async retrieveActiveElection(
    manager: EntityManager,
  ): Promise<ActiveElection | null> {
    const results = await manager.query(
      `
      SELECT 
        ae.id,
        ae.electionid,
        ae.createdby,
        ae.createdat,
        ae.updatedby,
        ae.updatedat
      FROM active_election ae
      INNER JOIN elections e ON ae.electionid = e.id
      WHERE ae.id = $1
        AND ae.electionid IS NOT NULL
      `,
      [ACTIVE_ELECTION_ID],
    );

    if (results.length === 0) {
      return null;
    }

    return this.toModel(results[0]);
  }

  async reset(manager: EntityManager): Promise<boolean> {
    try {
      const result = await manager.query(
        `
        UPDATE active_election
        SET electionid = NULL
        WHERE id = $1
        RETURNING *
        `,
        [ACTIVE_ELECTION_ID],
      );

      // Handle PostgreSQL result format: [rows, rowCount] or direct array
      let rows: any[];
      if (
        Array.isArray(result) &&
        result.length === 2 &&
        Array.isArray(result[0])
      ) {
        // Raw PostgreSQL driver format: [rows, rowCount]
        rows = result[0];
      } else if (Array.isArray(result)) {
        // TypeORM unwrapped format: array of rows
        rows = result;
      } else if (result && result.affectedRows !== undefined) {
        // MySQL format or TypeORM result object
        return result.affectedRows > 0;
      } else {
        rows = [];
      }

      return rows.length > 0;
    } catch (error) {
      throw error;
    }
  }

  async findById(
    id: number,
    manager: EntityManager,
  ): Promise<ActiveElection | null> {
    const result = await manager.query(
      `
      SELECT * FROM active_election WHERE id = $1
      `,
      [id],
    );
    if (result.length === 0) {
      return null;
    }
    return this.toModel(result[0]);
  }

  // Helper: Convert raw query result to domain model
  private toModel(row: any): ActiveElection {
    return new ActiveElection({
      id: row.id,
      electionId: row.electionid,
      createdBy: row.createdby,
      createdAt: row.createdat,
      updatedBy: row.updatedby,
      updatedAt: row.updatedat,
    });
  }
}
