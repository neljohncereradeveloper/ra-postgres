import {
  Controller,
  Body,
  Version,
  Patch,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { JwtBearerAuthGuard } from '@infrastructure/modules/auth/guards/jwt-auth.guard';
import { AuthorizeRoles } from '@infrastructure/modules/auth/decorators/roles.decorator';
import {
  AuthApplicationAccessEnum,
  AuthUserRolesEnum,
} from '@shared/constants/auth.constants';
import { AuthorizeApplicationAccess } from '@infrastructure/modules/auth/decorators/applicationaccess.decorator';
import { SetActiveElectionUseCase } from '@application/use-cases/active-election/set-active-election.use-case';
import { SetActiveElectionDto } from '../interface/dto/set-active-election.dto';
import { RetrieveActiveElectionUseCase } from '@application/use-cases/active-election/retrieve-active-election.use-case';
import { ResetActiveElectionUseCase } from '@application/use-cases/active-election/reset-active-election.use-case';

@Controller('active-election')
@UseGuards(JwtBearerAuthGuard)
export class ActiveElectionController {
  constructor(
    private readonly setActiveElectionUseCase: SetActiveElectionUseCase,
    private readonly retrieveActiveElectionUseCase: RetrieveActiveElectionUseCase,
    private readonly resetActiveElectionUseCase: ResetActiveElectionUseCase,
  ) {}

  @Version('1')
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Patch('set-active')
  async setActive(
    @Body() setActiveElectionDto: SetActiveElectionDto,
    @Request()
    req,
  ) {
    const userName = req.user.userName as string;
    return this.setActiveElectionUseCase.execute(
      setActiveElectionDto.electionName,
      userName,
    );
  }

  @Version('1')
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Patch('reset')
  async reset(@Request() req) {
    const userName = req.user.userName as string;
    return this.resetActiveElectionUseCase.execute(userName);
  }

  @Version('1')
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Get()
  async retrieve() {
    return this.retrieveActiveElectionUseCase.execute();
  }
}
