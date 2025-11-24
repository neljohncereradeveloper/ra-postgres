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
import { UpdateSettingUseCase } from '@application/use-cases/settings/update-setting.use-case';
import { UpdateSettingDto } from '../interface/dto/update-setting.dto';
import { RetrieveSettingUseCase } from '@application/use-cases/settings/retrieve-setting.use-case';
import { ResetElectionUseCase } from '@application/use-cases/settings/reset-election.use-case';
// Controller for handling client-related requests
@Controller('settings')
@UseGuards(JwtBearerAuthGuard)
export class SettingController {
  constructor(
    private readonly updateSettingUseCase: UpdateSettingUseCase,
    private readonly retrieveSettingUseCase: RetrieveSettingUseCase,
    private readonly resetElectionUseCase: ResetElectionUseCase,
  ) {}

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Patch('set-active')
  async update(
    @Body() updateSettingDto: UpdateSettingDto,
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.updateSettingUseCase.execute(
      updateSettingDto.electionName,
      userId,
    );
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Patch('reset')
  async resetElection(
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.resetElectionUseCase.execute(userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Get()
  async retrieveSetting() {
    return this.retrieveSettingUseCase.execute();
  }
}
