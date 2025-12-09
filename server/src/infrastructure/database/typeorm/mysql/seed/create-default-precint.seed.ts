import { EntityManager } from 'typeorm';
import { PrecinctEntity } from '../entities/precinct.entity';
import { Logger } from '@nestjs/common';

/**
 * SeedPrecinctRoles
 *
 * Handles the seeding of precinct, ensuring that each precinct is created only if it doesn't already exist.
 */
export class SeedPrecinct {
  private readonly logger = new Logger('SeedPrecinct');

  constructor(private readonly dataSource: EntityManager) {}

  /**
   * Run the seeder to populate precinct roles.
   */
  async run(): Promise<void> {
    const precinctRepository = this.dataSource.getRepository(PrecinctEntity);

    // Define the roles to seed
    const precincts = ['default', 'precinct 1', 'precinct 2', 'precinct 3'];

    for (const precinctDesc of precincts) {
      // Check if the role already exists
      const existingPrecinct = await precinctRepository.findOne({
        where: { desc1: precinctDesc },
      });

      if (!existingPrecinct) {
        // Insert the role if it does not exist
        await precinctRepository.insert({ desc1: precinctDesc });
        this.logger.log(`Precinct '${precinctDesc}' created successfully.`);
      } else {
        this.logger.log(`Precinct '${precinctDesc}' already exists.`);
      }
    }
  }
}
