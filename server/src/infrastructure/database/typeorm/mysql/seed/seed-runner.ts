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
import { SettingEntity } from '../entities/setting.entity';
import { SeedSettings } from './create-default-settings.seed';
import { PositionEntity } from '../entities/position.entity';
import { CastVoteEntity } from '../entities/cast-vote.entity';
import { ActivityLogEntity } from '../entities/activity-log.entity';
import { BallotEntity } from '../entities/ballot.entity';
import { CandidateEntity } from '../entities/candidate.entity';
import { PrecinctEntity } from '../entities/precinct.entity';
// Load environment variables from .env
dotenvConfig();

// Define the standalone DataSource configuration
const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'ytu55sw995rs',
  database: process.env.DB_DATABASE || 'districtassembly',
  entities: [
    ActivityLogEntity,
    ApplicationAccessEntity,
    DistrictEntity,
    PositionEntity,
    CandidateEntity,
    BallotEntity,
    ElectionEntity,
    DelegateEntity,
    SettingEntity,
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
      const seedSettings = new SeedSettings(queryRunner.manager);

      await userRoleSeeder.run();
      await applicationAccessSeeder.run();
      await userSeeder.run();
      await seedSettings.run();

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
