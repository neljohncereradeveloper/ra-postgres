import { DataSource } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { SeedUserRoles } from './create-default-user-roles.seed';
import { Logger } from '@nestjs/common';
import { UserRoleEntity } from '../entities/user-role.entity';
import { UserEntity } from '../entities/user.entity';
import { SeedUsers } from './create-initial-users.seed';
import { SeedApplicationAccess } from './create-default-application-access.seed';
import { ApplicationAccessEntity } from '../entities/application-access.entity';
import { DistrictEntity } from '../entities/district.entity';
import { ElectionEntity } from '../entities/election.entity';
import { DelegateEntity } from '../entities/delegate.entity';
import { ActiveElectionEntity } from '../entities/active-election.entity';
import { SeedActiveElection } from './create-default-active-election.seed';
import { PositionEntity } from '../entities/position.entity';
import { CastVoteEntity } from '../entities/cast-vote.entity';
import { ActivityLogEntity } from '../entities/activity-log.entity';
import { BallotEntity } from '../entities/ballot.entity';
import { CandidateEntity } from '../entities/candidate.entity';
import { PrecinctEntity } from '../entities/precinct.entity';
import { SeedPrecinct } from './create-default-PRECINT.seed';

// Load environment variables from .env
dotenvConfig();

// Define the standalone DataSource configuration
const dataSource = new DataSource({
  type: process.env.DB_TYPE as 'mysql' | 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    ActivityLogEntity,
    ApplicationAccessEntity,
    DistrictEntity,
    PositionEntity,
    CandidateEntity,
    BallotEntity,
    ElectionEntity,
    DelegateEntity,
    ActiveElectionEntity,
    UserRoleEntity,
    UserEntity,
    CastVoteEntity,
    PrecinctEntity,
  ], // Adjust path to your compiled entities
  synchronize: false, // Avoid sync in production
  logging: process.env.DB_LOGGING === 'true',
});

class SeedRunner {
  private readonly logger = new Logger('SeedRunner');

  constructor(private readonly dataSource: DataSource) {}

  async run() {
    // Initialize database connection
    await this.dataSource.initialize();
    this.logger.debug('Seeder Database connected successfully.');

    // Start a query runner for manual transaction control
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Execute all seeds within the transaction
      const userRoleSeeder = new SeedUserRoles(queryRunner.manager);
      const applicationAccessSeeder = new SeedApplicationAccess(
        queryRunner.manager,
      );
      const userSeeder = new SeedUsers(queryRunner.manager);
      const seedActiveElection = new SeedActiveElection(queryRunner.manager);

      const seedPrecinct = new SeedPrecinct(queryRunner.manager);

      await userRoleSeeder.run();
      await applicationAccessSeeder.run();
      await userSeeder.run();
      await seedActiveElection.run();
      await seedPrecinct.run();

      // Commit the transaction if all seeds succeed
      await queryRunner.commitTransaction();
      this.logger.debug('All seeds executed successfully.');
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      this.logger.error(
        'Error during seeding, transaction rolled back:',
        error,
      );
    } finally {
      // Release the query runner and close the database connection
      await queryRunner.release();
      await this.dataSource.destroy();
      this.logger.debug('Seeder Database closed successfully.');
    }
  }
}

// Execute the seed runner
new SeedRunner(dataSource).run();
