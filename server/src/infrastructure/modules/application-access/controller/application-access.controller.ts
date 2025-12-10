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
    private readonly paginatedApplicationAccessListUseCase: PaginatedApplicationAccessListUseCase,
    private readonly archiveApplicationAccessUseCase: ArchiveApplicationAccessUseCase,
    private readonly restoreApplicationAccessUseCase: RestoreApplicationAccessUseCase,
    private readonly comboboxApplicationAccessUseCase: ComboboxApplicationAccessUseCase,
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
  async paginatedList(
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
    return await this.paginatedApplicationAccessListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      is_archived,
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  async combobox() {
    return this.comboboxApplicationAccessUseCase.execute();
  }

  @Version('1') // API versioning
  @Delete('archive/:id')
  async archive(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.archiveApplicationAccessUseCase.execute(id, user_name);
  }

  @Version('1') // API versioning
  @Patch('restore/:id')
  async restore(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.restoreApplicationAccessUseCase.execute(id, user_name);
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
