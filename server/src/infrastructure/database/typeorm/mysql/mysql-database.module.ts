import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTypeormConfig } from './config/typeorm.config';
import { ApplicationAccessEntity } from './entities/application-access.entity';
import { DistrictEntity } from './entities/district.entity';
import { ElectionEntity } from './entities/election.entity';
import { DelegateEntity } from './entities/delegate.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { UserEntity } from './entities/user.entity';
import { ActivityLogEntity } from './entities/activity-log.entity';
import { PositionEntity } from './entities/position.entity';
import { CandidateEntity } from './entities/candidate.entity';
import { BallotEntity } from './entities/ballot.entity';
import { CastVoteEntity } from './entities/cast-vote.entity';
import { SettingEntity } from './entities/setting.entity';
import { PrecinctEntity } from './entities/precinct.entity';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load .env configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getTypeormConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      ApplicationAccessEntity,
      DistrictEntity,
      PositionEntity,
      CandidateEntity,
      BallotEntity,
      ElectionEntity,
      DelegateEntity,
      UserRoleEntity,
      UserEntity,
      ActivityLogEntity,
      CastVoteEntity,
      SettingEntity,
      PrecinctEntity,
    ]), // Register entities here
  ],
  exports: [TypeOrmModule], // Export TypeOrmModule for use in other modules
})
export class MysqlDatabaseModule {}
