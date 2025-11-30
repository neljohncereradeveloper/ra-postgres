import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager, UpdateResult } from 'typeorm';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ActiveElectionEntity } from '../entities/active-election.entity';
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
      const result: UpdateResult = await manager.update(
        ActiveElectionEntity,
        { id: this.ACTIVE_ELECTION_ID },
        {
          electionId,
        },
      );
      return result.affected && result.affected > 0;
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
    const activeElectionEntity = await manager
      .createQueryBuilder(ActiveElectionEntity, 'activeElection')
      .innerJoinAndSelect('activeElection.election', 'election')
      .where('activeElection.id = :id', { id: this.ACTIVE_ELECTION_ID })
      .andWhere('activeElection.electionId IS NOT NULL')
      .getOne();

    return activeElectionEntity ? this.toModel(activeElectionEntity) : null;
  }

  async reset(manager: EntityManager): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        ActiveElectionEntity,
        { id: this.ACTIVE_ELECTION_ID },
        {
          electionId: null,
        },
      );
      return result.affected && result.affected > 0;
    } catch (error) {
      throw error;
    }
  }

  // Helper: Convert TypeORM entity to domain model
  private toModel(entity: ActiveElectionEntity): ActiveElection {
    return new ActiveElection({
      id: entity.id,
      electionId: entity.electionId,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedBy: entity.updatedBy,
      updatedAt: entity.updatedAt,
    });
  }
}
