import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { ActivityLogEntity } from '../entities/activity-log.entity';
import { ApplicationAccessEntity } from '../entities/application-access.entity';
import { DistrictEntity } from '../entities/district.entity';
import { DelegateEntity } from '../entities/delegate.entity';
import { UserRoleEntity } from '../entities/user-role.entity';
import { UserEntity } from '../entities/user.entity';
import { ElectionEntity } from '../entities/election.entity';
import { PositionEntity } from '../entities/position.entity';
import { CandidateEntity } from '../entities/candidate.entity';
import { BallotEntity } from '../entities/ballot.entity';
import { CastVoteEntity } from '../entities/cast-vote.entity';
import { PrecinctEntity } from '../entities/precinct.entity';
import { ActiveElectionEntity } from '../entities/active-election.entity';
config();
const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: Number(configService.get('DB_PORT')),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [
    ActivityLogEntity,
    ApplicationAccessEntity,
    UserRoleEntity,
    UserEntity,
    ActiveElectionEntity,
    ElectionEntity,
    DelegateEntity,
    DistrictEntity,
    PositionEntity,
    CandidateEntity,
    CastVoteEntity,
    BallotEntity,
    PrecinctEntity,
  ], // this uses the compiled entites in the dist folder
  migrations: [
    'dist/infrastructure/database/typeorm/mysql/migrations/files/*.{ts,js}',
  ],
  logging: configService.get('NODE_ENV') === 'development',
  synchronize: false,
});
