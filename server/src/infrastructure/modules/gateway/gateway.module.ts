import { Module } from '@nestjs/common';
import { GatewayGateway } from './gateway.gateway';
import { ReportsModule } from '@infrastructure/modules/reports/reports.module';
import { CastVoteReportUseCase } from '@application/use-cases/reports/cast-votes-report.use-case';

@Module({
  imports: [ReportsModule],
  providers: [GatewayGateway],
  exports: [GatewayGateway],
})
export class GatewayModule {}
