import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ActiveElection } from '@domain/models/active-election.model';

@Injectable()
export class ActiveElectionRepositoryImpl
  implements ActiveElectionRepository<EntityManager>
{
  private readonly ACTIVE_ELECTION_ID = 1;

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
        `,
        [electionId, this.ACTIVE_ELECTION_ID],
      );

      return result.affectedRows && result.affectedRows > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
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
        ae.electionid as electionid,
        ae.createdby as createdby,
        ae.createdat as createdat,
        ae.updatedby as updatedby,
        ae.updatedat as updatedat
      FROM active_election ae
      INNER JOIN elections e ON ae.electionid = e.id
      WHERE ae.id = $1
        AND ae.electionid IS NOT NULL
      `,
      [this.ACTIVE_ELECTION_ID],
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
        `,
        [this.ACTIVE_ELECTION_ID],
      );

      return result.affectedRows && result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
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
