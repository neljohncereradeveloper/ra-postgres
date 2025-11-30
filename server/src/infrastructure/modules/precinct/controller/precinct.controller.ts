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
import { CreatePrecinctUseCase } from '@application/use-cases/precinct/create-precinct.use-case';
import { ComboboxPrecinctUseCase } from '@application/use-cases/precinct/combobox-precinct.use-case';
import { PaginatedPrecinctListUseCase } from '@application/use-cases/precinct/paginated-precinct-list.use-case';
import { UpdatePrecinctUseCase } from '@application/use-cases/precinct/update-precinct.use-case';
import { RestorePrecinctUseCase } from '@application/use-cases/precinct/restore-precinct.use-case';
import { ArchivePrecinctUseCase } from '@application/use-cases/precinct/archive-precinct.use-case';
import { CreatePrecinctDto } from '../interface/dto/create-precinct.dto';
import { UpdatePrecinctDto } from '../interface/dto/update-precinct.dto';

// Controller for handling precinct-related requests
@Controller('precincts')
@UseGuards(JwtBearerAuthGuard)
export class PrecinctController {
  constructor(
    private readonly createPrecinctUseCase: CreatePrecinctUseCase,
    private readonly updatePrecinctUseCase: UpdatePrecinctUseCase,
    private readonly findPrecinctsWithFiltersUseCase: PaginatedPrecinctListUseCase,
    private readonly softDeletePrecinctUseCase: ArchivePrecinctUseCase,
    private readonly restoreDeletePrecinctUseCase: RestorePrecinctUseCase,
    private readonly retrieveComboboxPrecinctUseCase: ComboboxPrecinctUseCase,
  ) {}

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Post()
  async create(
    @Body() createPrecinctDto: CreatePrecinctDto,
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.createPrecinctUseCase.execute(createPrecinctDto, userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
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
    return await this.findPrecinctsWithFiltersUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      isDeleted,
    );
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin, AuthUserRolesEnum.Precinct)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Get('combobox')
  async retrieveCombobox() {
    return this.retrieveComboboxPrecinctUseCase.execute();
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Delete('delete/:id')
  async delete(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.softDeletePrecinctUseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Patch('restore/:id')
  async restore(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.restoreDeletePrecinctUseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePrecinctDto: UpdatePrecinctDto,
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.updatePrecinctUseCase.execute(id, updatePrecinctDto, userId);
  }
}
