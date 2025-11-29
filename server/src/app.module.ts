import { MysqlDatabaseModule } from '@infrastructure/database/typeorm-mysql/mysql-database.module';
import { ErrorLoggerMiddleware } from '@infrastructure/middlewares/error-logger.middleware';
import { IpRestrictiomMiddleware } from '@infrastructure/middlewares/ip-restrictiom.middleware';
import { RequestLoggerMiddleware } from '@infrastructure/middlewares/request-logger.middleware';
import { ApplicationAccessModule } from '@infrastructure/modules/application-access/application-access.module';
import { AuthModule } from '@infrastructure/modules/auth/auth.module';
import { ApplicationAccessGuard } from '@infrastructure/modules/auth/guards/application-access.guard';
import { UserRolesGuard } from '@infrastructure/modules/auth/guards/user-roles.guard';
import { DatabaseManagementModule } from '@infrastructure/modules/database-management/database-management.module';
import { DistrictModule } from '@infrastructure/modules/district/district.module';
import { ElectionModule } from '@infrastructure/modules/election/election.module';
import { DelegateModule } from '@infrastructure/modules/delegate/delegate.module';
import { ActiveElectionModule } from '@infrastructure/modules/active-election/active-election.module';
import { UserRoleModule } from '@infrastructure/modules/user-role/user-role.module';
import { UserModule } from '@infrastructure/modules/user/user.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PositionModule } from '@infrastructure/modules/position/position.module';
import { CandidateModule } from '@infrastructure/modules/candidate/candidate.module';
import { CastVoteModule } from '@infrastructure/modules/cast-vote/cast-vote.module';
import { PrecinctModule } from '@infrastructure/modules/precinct/precinct.module';
import { ReportsModule } from '@infrastructure/modules/reports/reports.module';
import { GatewayModule } from '@infrastructure/modules/gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Make environment variables globally accessible
    MysqlDatabaseModule,
    DistrictModule,
    PositionModule,
    CandidateModule,
    ElectionModule,
    DelegateModule,
    UserRoleModule,
    ApplicationAccessModule,
    UserModule,
    AuthModule,
    DatabaseManagementModule,
    ActiveElectionModule,
    CastVoteModule,
    PrecinctModule,
    ReportsModule,
    GatewayModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UserRolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ApplicationAccessGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        IpRestrictiomMiddleware,
        RequestLoggerMiddleware,
        ErrorLoggerMiddleware,
      )
      .forRoutes('*'); // Logs all requests
  }
}
