import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager, UpdateResult } from 'typeorm';
import { SettingsRepository } from '@domains/repositories/setting.repository';
import { SettingEntity } from '../entities/setting.entity';
import { Setting } from '@domain/models/setting.model';
import { SEEDERS_CONSTANTS } from '@shared/constants/seeders.constants';

@Injectable()
export class SettingsRepositoryImpl
  implements SettingsRepository<EntityManager>
{
  async update(electionId: number, manager: EntityManager): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        SettingEntity,
        { setupCode: SEEDERS_CONSTANTS.SETUP_CODE },
        {
          electionId,
        },
      );
      return result.affected && result.affected > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Setting already exists');
      }
      throw error;
    }
  }

  async retrieveActiveElection(
    manager: EntityManager,
  ): Promise<Setting | null> {
    const settingEntity = await manager
      .createQueryBuilder(SettingEntity, 'setting') // Start query for SettingEntity
      .innerJoinAndSelect('setting.election', 'election') // Inner join with the elections table
      .where('setting.setupCode = :setupCode', {
        setupCode: SEEDERS_CONSTANTS.SETUP_CODE,
      }) // Filter by setupCode
      .andWhere('setting.electionId IS NOT NULL') // Ensure electionId is not null
      .getOne(); // Retrieve a single result

    return settingEntity;
  }

  async resetElection(manager: EntityManager): Promise<boolean> {
    try {
      const result: UpdateResult = await manager.update(
        SettingEntity,
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
}
