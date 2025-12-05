import { EntityManager } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ActiveElectionEntity } from '../entities/active-election.entity';
import { ACTIVE_ELECTION_ID } from '../../../../../domain/constants/active-election/active-election-actions.constants';

/**
 * SeedActiveElection
 *
 * Handles the seeding of the active election record, ensuring it is created only if it doesn't already exist.
 */
export class SeedActiveElection {
  private readonly logger = new Logger('SeedActiveElection');

  constructor(private readonly dataSource: EntityManager) {}

  /**
   * Run the seeder to create the active election record.
   */
  async run(): Promise<void> {
    const activeElectionRepository =
      this.dataSource.getRepository(ActiveElectionEntity);

    await activeElectionRepository.insert({
      id: ACTIVE_ELECTION_ID,
    });
    this.logger.log(`Active election record (id: 1) created successfully.`);
  }
}
