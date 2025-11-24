import { Controller, Version, Get, UseGuards, Request } from '@nestjs/common';
import { JwtBearerAuthGuard } from '@infrastructure/modules/auth/guards/jwt-auth.guard';
import { AuthorizeRoles } from '@infrastructure/modules/auth/decorators/roles.decorator';
import {
  AuthApplicationAccessEnum,
  AuthUserRolesEnum,
} from '@shared/constants/auth.constants';
import { AuthorizeApplicationAccess } from '@infrastructure/modules/auth/decorators/applicationaccess.decorator';
import { CastVoteReportUseCase } from '@application/use-cases/reports/cast-votes-report.use-case';
import { CandidatesReportUseCase } from '@application/use-cases/reports/candidates-report.use-case';

// Controller for handling client-related requests
@Controller('reports')
@UseGuards(JwtBearerAuthGuard)
export class ReportsController {
  constructor(
    private readonly castVoteReportUseCase: CastVoteReportUseCase,
    private readonly candidatesReportUseCase: CandidatesReportUseCase,
  ) {}

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Get('cast-vote-report')
  async retrieveCastVoteReport(
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.castVoteReportUseCase.execute(userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Get('candidates-report')
  async retrieveCandidatesReport(
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.candidatesReportUseCase.execute(userId);
  }
}
