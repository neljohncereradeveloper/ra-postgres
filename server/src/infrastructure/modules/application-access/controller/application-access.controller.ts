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
import { FindApplicationAccesssWithFiltersUseCase } from '@application/use-cases/application-access/find-with-filters-application-access.use-case';
import { SoftDeleteApplicationAccessUseCase } from '@application/use-cases/application-access/soft-delete-application-access.use-case';
import { RestoreDeleteApplicationAccessUseCase } from '@application/use-cases/application-access/restore-delete-application-access.use-case';
import { RetrieveComboboxApplicationAccessUseCase } from '@application/use-cases/application-access/retrieve-combobox-application-access.use-case';
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
    private readonly findApplicationAccesssWithFiltersUseCase: FindApplicationAccesssWithFiltersUseCase,
    private readonly softDeleteApplicationAccessUseCase: SoftDeleteApplicationAccessUseCase,
    private readonly restoreDeleteApplicationAccessUseCase: RestoreDeleteApplicationAccessUseCase,
    private readonly retrieveComboboxApplicationAccessUseCase: RetrieveComboboxApplicationAccessUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  async create(
    @Body() createApplicationAccessDto: CreateApplicationAccessDto,
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.createApplicationAccessUseCase.execute(
      createApplicationAccessDto,
      userId,
    );
  }

  @Version('1') // API versioning
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
    return await this.findApplicationAccesssWithFiltersUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      isDeleted,
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
    const userId = req.user.id;
    return this.softDeleteApplicationAccessUseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @Patch('restore/:id')
  async restore(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.restoreDeleteApplicationAccessUseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateApplicationAccessDto: UpdateApplicationAccessDto,
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.updateApplicationAccessUseCase.execute(
      id,
      updateApplicationAccessDto,
      userId,
    );
  }
}
