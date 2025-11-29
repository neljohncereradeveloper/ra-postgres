import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager, UpdateResult } from 'typeorm';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { ActiveElectionEntity } from '../entities/active-election.entity';
import { ActiveElection } from '@domain/models/active-election.model';
import { SEEDERS_CONSTANTS } from '@shared/constants/seeders.constants';

@Injectable()
export class ActiveElectionRepositoryImpl
  implements ActiveElectionRepository<EntityManager>
{
  async update(electionId: number, manager: EntityManager): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        ActiveElectionEntity,
        { setupCode: SEEDERS_CONSTANTS.SETUP_CODE },
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
      .where('activeElection.setupCode = :setupCode', {
        setupCode: SEEDERS_CONSTANTS.SETUP_CODE,
      })
      .andWhere('activeElection.electionId IS NOT NULL')
      .getOne();

    return activeElectionEntity
      ? this.toModel(activeElectionEntity)
      : null;
  }

  async resetElection(manager: EntityManager): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        ActiveElectionEntity,
        { setupCode: SEEDERS_CONSTANTS.SETUP_CODE },
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
      setupCode: entity.setupCode,
      electionId: entity.electionId,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedBy: entity.updatedBy,
      updatedAt: entity.updatedAt,
    });
  }
}

