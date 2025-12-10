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
import { CreateApplicationAccessUseCase } from '@application/use-cases/application-access/create-application-access.use-case';
import { CreateApplicationAccessDto } from '../interface/dto/create-application-access.dto';
import { UpdateApplicationAccessDto } from '../interface/dto/update-application-access.dto';
import { UpdateApplicationAccessUseCase } from '@application/use-cases/application-access/update-application-access.use-case';
import { PaginatedApplicationAccessListUseCase } from '@application/use-cases/application-access/paginated-application-access-list.use-case';
import { ArchiveApplicationAccessUseCase } from '@application/use-cases/application-access/archive-application-access.use-case';
import { RestoreApplicationAccessUseCase } from '@application/use-cases/application-access/restore-application-access.use-case';
import { ComboboxApplicationAccessUseCase } from '@application/use-cases/application-access/combobox-application-access.use-case';
import { JwtBearerAuthGuard } from '@infrastructure/modules/auth/guards/jwt-auth.guard';
import { AuthorizeRoles } from '@infrastructure/modules/auth/decorators/roles.decorator';
import {
  AuthApplicationAccessEnum,
  AuthUserRolesEnum,
} from '@shared/constants/auth.constants';
import { AuthorizeApplicationAccess } from '@infrastructure/modules/auth/decorators/applicationaccess.decorator';

// Controller for handling client-related requests
@Controller('applicationaccess')
@UseGuards(JwtBearerAuthGuard)
@AuthorizeRoles(AuthUserRolesEnum.Admin)
@AuthorizeApplicationAccess(AuthApplicationAccessEnum.AdminModule)
export class ApplicationAccessController {
  constructor(
    private readonly createApplicationAccessUseCase: CreateApplicationAccessUseCase,
    private readonly updateApplicationAccessUseCase: UpdateApplicationAccessUseCase,
    private readonly findApplicationAccesssWithFiltersUseCase: PaginatedApplicationAccessListUseCase,
    private readonly softDeleteApplicationAccessUseCase: ArchiveApplicationAccessUseCase,
    private readonly restoreDeleteApplicationAccessUseCase: RestoreApplicationAccessUseCase,
    private readonly retrieveComboboxApplicationAccessUseCase: ComboboxApplicationAccessUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  async create(
    @Body() createApplicationAccessDto: CreateApplicationAccessDto,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.createApplicationAccessUseCase.execute(
      createApplicationAccessDto,
      user_name,
    );
  }

  @Version('1') // API versioning
  @Get()
  async findWithFilters(
    @Query('term') term: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('is_archived') is_archived: boolean,
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
    return await this.findApplicationAccesssWithFiltersUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      is_archived,
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  async retrieveCombobox() {
    return this.retrieveComboboxApplicationAccessUseCase.execute();
  }

  @Version('1') // API versioning
  @Delete('delete/:id')
  async delete(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.softDeleteApplicationAccessUseCase.execute(id, user_name);
  }

  @Version('1') // API versioning
  @Patch('restore/:id')
  async restore(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.restoreDeleteApplicationAccessUseCase.execute(id, user_name);
  }

  @Version('1') // API versioning
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateApplicationAccessDto: UpdateApplicationAccessDto,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.updateApplicationAccessUseCase.execute(
      id,
      updateApplicationAccessDto,
      user_name,
    );
  }
}
