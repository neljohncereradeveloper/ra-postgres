import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ApplicationAccessEntity } from '../entities/application-access.entity';

/**
 * SeedApplicationAccess
 *
 * Handles the seeding of application access data.
 */
export class SeedApplicationAccess {
  private readonly logger = new Logger('SeedApplicationAccess');

  constructor(private readonly dataSource: EntityManager) {}

  /**
   * Run the seeder to populate application access data.
   */
  async run(): Promise<void> {
    const applicationAccessRepository = this.dataSource.getRepository(
      ApplicationAccessEntity,
    );

    // Define the application modules to be seeded
    const applicationModules = [
      'admin module',
      'cast vote module',
      'election module',
    ];

    for (const moduleDesc of applicationModules) {
      // Check if the module already exists to avoid duplicates
      const existingModule = await applicationAccessRepository.findOne({
        where: { desc1: moduleDesc },
      });

      if (!existingModule) {
        await applicationAccessRepository.insert({ desc1: moduleDesc });
        this.logger.log(
          `Application access '${moduleDesc}' created successfully.`,
        );
      } else {
        this.logger.log(`Application access '${moduleDesc}' already exists.`);
      }
    }
  }
}
