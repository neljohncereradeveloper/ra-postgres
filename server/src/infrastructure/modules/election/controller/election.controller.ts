import {
  Controller,
  Post,
  Body,
  Version,
  Patch,
  Param,
  Query,
  Get,
  BadRequestException,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtBearerAuthGuard } from '@infrastructure/modules/auth/guards/jwt-auth.guard';
import { AuthorizeRoles } from '@infrastructure/modules/auth/decorators/roles.decorator';
import {
  AuthApplicationAccessEnum,
  AuthUserRolesEnum,
} from '@shared/constants/auth.constants';
import { AuthorizeApplicationAccess } from '@infrastructure/modules/auth/decorators/applicationaccess.decorator';
import { CreateElectionUseCase } from '@application/use-cases/election/create-election.use-case';
import { PaginatedElectionListUseCase } from '@application/use-cases/election/paginated-election-list.use-case';
import { UpdateElectionUseCase } from '@application/use-cases/election/update-election.use-case';
import { ArchiveElectionUseCase } from '@application/use-cases/election/archive-election.use-case';
import { RestoreElectionUseCase } from '@application/use-cases/election/restore-election.use-case';
import { StartElectionUseCase } from '@application/use-cases/election/start-election.use-case';
import { CloseElectionUseCase } from '@application/use-cases/election/close-election.use-case';
import { ComboboxElectionUseCase } from '@application/use-cases/election/combobox-election.use-case';
import { CancelElectionUseCase } from '@application/use-cases/election/cancel-election.use-case';
import { CreateElectionDto } from '../interface/dto/create-election.dto';
import { UpdateElectionDto } from '../interface/dto/update-election.dto';
import { ComboboxScheduledElectionUseCase } from '@application/use-cases/election/combobox-scheduled-election.use-case';

// Controller for handling client-related requests
@Controller('elections')
@UseGuards(JwtBearerAuthGuard)
@AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
export class ElectionController {
  constructor(
    private readonly createElectionUseCase: CreateElectionUseCase,
    private readonly updateElectionUseCase: UpdateElectionUseCase,
    private readonly findElectionsWithFiltersUseCase: PaginatedElectionListUseCase,
    private readonly softDeleteElectionUseCase: ArchiveElectionUseCase,
    private readonly restoreDeleteElectionUseCase: RestoreElectionUseCase,
    private readonly startElectionUseCase: StartElectionUseCase,
    private readonly closeElectionUseCase: CloseElectionUseCase,
    private readonly cancelElectionUseCase: CancelElectionUseCase,
    private readonly retrieveComboboxElectionUseCase: ComboboxElectionUseCase,
    private readonly retrieveComboboxScheduledElectionUseCase: ComboboxScheduledElectionUseCase,
  ) {}

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Post()
  async create(
    @Body() createElectionDto: CreateElectionDto,
    @Request()
    req,
  ) {
    const userName = req.user.userName as string;
    return this.createElectionUseCase.execute(createElectionDto, userName);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Get()
  async findWithFilters(
    @Query('term') term: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('isArchived') isArchived: boolean,
  ) {
    // Validate and parse query parameters
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;

    if (parsedPage < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }

    if (parsedLimit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    // Execute the use case
    return await this.findElectionsWithFiltersUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      isArchived,
    );
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Get('combobox')
  async retrieveCombobox() {
    return this.retrieveComboboxElectionUseCase.execute();
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Get('combobox/scheduled')
  async retrieveComboboxScheduled() {
    return this.retrieveComboboxScheduledElectionUseCase.execute();
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Delete('delete/:id')
  async delete(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const userName = req.user.userName as string;
    return this.softDeleteElectionUseCase.execute(id, userName);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Patch('restore/:id')
  async restore(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const userName = req.user.userName as string;
    return this.restoreDeleteElectionUseCase.execute(id, userName);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Patch('start')
  async startElection(
    @Request()
    req,
  ) {
    const userName = req.user.userName as string;
    return this.startElectionUseCase.execute(userName);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Patch('close')
  async closeElection(
    @Request()
    req,
  ) {
    const userName = req.user.userName as string;
    return this.closeElectionUseCase.execute(userName);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Patch('cancel')
  async cancelElection(
    @Request()
    req,
  ) {
    const userName = req.user.userName as string;
    return this.cancelElectionUseCase.execute(userName);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateElectionDto: UpdateElectionDto,
    @Request()
    req,
  ) {
    const userName = req.user.userName as string;
    return this.updateElectionUseCase.execute(id, updateElectionDto, userName);
  }
}
