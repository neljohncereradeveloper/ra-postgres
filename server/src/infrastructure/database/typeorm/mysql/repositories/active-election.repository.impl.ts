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
    election_id: number,
    manager: EntityManager,
  ): Promise<boolean> {
    try {
      const result = await manager.query(
        `
        UPDATE active_election
        SET election_id = $1
        WHERE id = $2
        RETURNING *
        `,
        [election_id, ACTIVE_ELECTION_ID],
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
        ae.election_id,
        ae.created_by,
        ae.created_at,
        ae.updated_by,
        ae.updated_at
      FROM active_election ae
      INNER JOIN elections e ON ae.election_id = e.id
      WHERE ae.id = $1
        AND ae.election_id IS NOT NULL
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
        SET election_id = NULL
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
      election_id: row.election_id,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_by: row.updated_by,
      updated_at: row.updated_at,
    });
  }
}
