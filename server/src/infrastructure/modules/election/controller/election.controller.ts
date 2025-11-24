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
import { FindPaginatedElectionsUseCase } from '@application/use-cases/election/find-paginated-elections.use-case';
import { UpdateElectionUseCase } from '@application/use-cases/election/update-election.use-case';
import { SoftDeleteElectionUseCase } from '@application/use-cases/election/soft-delete-election.use-case';
import { RestoreDeleteElectionUseCase } from '@application/use-cases/election/restore-delete-election.use-case';
import { StartElectionUseCase } from '@application/use-cases/election/start-election.use-case';
import { CloseElectionUseCase } from '@application/use-cases/election/close-election.use-case';
import { RetrieveComboboxElectionUseCase } from '@application/use-cases/election/retrieve-combobox-election.use-case';
import { CancelElectionUseCase } from '@application/use-cases/election/cancel-election.use-case';
import { CreateElectionDto } from '../interface/dto/create-election.dto';
import { UpdateElectionDto } from '../interface/dto/update-election.dto';
import { RetrieveScheduledElectionUseCase } from '@application/use-cases/election/retrieve-scheduled-election.use-case';

// Controller for handling client-related requests
@Controller('elections')
@UseGuards(JwtBearerAuthGuard)
@AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionManagementModule)
export class ElectionController {
  constructor(
    private readonly createElectionUseCase: CreateElectionUseCase,
    private readonly updateElectionUseCase: UpdateElectionUseCase,
    private readonly findElectionsWithFiltersUseCase: FindPaginatedElectionsUseCase,
    private readonly softDeleteElectionUseCase: SoftDeleteElectionUseCase,
    private readonly restoreDeleteElectionUseCase: RestoreDeleteElectionUseCase,
    private readonly startElectionUseCase: StartElectionUseCase,
    private readonly closeElectionUseCase: CloseElectionUseCase,
    private readonly cancelElectionUseCase: CancelElectionUseCase,
    private readonly retrieveComboboxElectionUseCase: RetrieveComboboxElectionUseCase,
    private readonly retrieveScheduledElectionUseCase: RetrieveScheduledElectionUseCase,
  ) {}

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Post()
  async create(
    @Body() createElectionDto: CreateElectionDto,
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.createElectionUseCase.execute(createElectionDto, userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Get()
  async findWithFilters(
    @Query('term') term: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('isDeleted') isDeleted: boolean,
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
      isDeleted,
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
  @Get('scheduled')
  async retrieveScheduled() {
    return this.retrieveScheduledElectionUseCase.execute();
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Delete('delete/:id')
  async delete(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.softDeleteElectionUseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Patch('restore/:id')
  async restore(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.restoreDeleteElectionUseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Patch('start')
  async startElection(
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.startElectionUseCase.execute(userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Patch('close')
  async closeElection(
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.closeElectionUseCase.execute(userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @Patch('cancel')
  async cancelElection(
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.cancelElectionUseCase.execute(userId);
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
    const userId = req.user.id;
    return this.updateElectionUseCase.execute(id, updateElectionDto, userId);
  }
}
