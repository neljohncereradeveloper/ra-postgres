import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { SettingEntity } from '../entities/setting.entity';

/**
 * SeedSettings
 *
 * Handles the seeding of user roles, ensuring that each role is created only if it doesn't already exist.
 */
export class SeedSettings {
  private readonly logger = new Logger('SeedSettings');

  constructor(private readonly dataSource: EntityManager) {}

  /**
   * Run the seeder to populate user roles.
   */
  async run(): Promise<void> {
    const settingRepository = this.dataSource.getRepository(SettingEntity);

    await settingRepository.insert({
      setupCode: '001',
    });
    this.logger.log(`Settings setupCode : 001 created successfully.`);
  }
}
