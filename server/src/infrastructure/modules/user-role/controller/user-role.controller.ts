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
import { CreateUserRoleUseCase } from '@application/use-cases/user-role/create-user-role.use-case';
import { CreateUserRoleDto } from '../interface/dto/create-user-role.dto';
import { UpdateUserRoleDto } from '../interface/dto/update-user-role.dto';
import { UpdateUserRoleUseCase } from '@application/use-cases/user-role/update-user-role.use-case';
import { PaginatedUserRoleListUseCase } from '@application/use-cases/user-role/paginated-user-role-list.use-case';
import { ArchiveUserRoleUseCase } from '@application/use-cases/user-role/archive-user-role.use-case';
import { RestoreDeleteUserRoleUseCase } from '@application/use-cases/user-role/restore-user-role.use-case';
import { ComboboxUserRoleUseCase } from '@application/use-cases/user-role/combobox-user-role.use-case';
import { JwtBearerAuthGuard } from '@infrastructure/modules/auth/guards/jwt-auth.guard';
import { AuthorizeRoles } from '@infrastructure/modules/auth/decorators/roles.decorator';
import {
  AuthApplicationAccessEnum,
  AuthUserRolesEnum,
} from '@shared/constants/auth.constants';
import { AuthorizeApplicationAccess } from '@infrastructure/modules/auth/decorators/applicationaccess.decorator';

// Controller for handling client-related requests
@Controller('userroles')
@UseGuards(JwtBearerAuthGuard)
@AuthorizeRoles(AuthUserRolesEnum.Admin)
@AuthorizeApplicationAccess(AuthApplicationAccessEnum.AdminModule)
export class UserRoleController {
  constructor(
    private readonly createUserRoleUseCase: CreateUserRoleUseCase,
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
    private readonly findUserRolesWithFiltersUseCase: PaginatedUserRoleListUseCase,
    private readonly softDeleteUserRoleUseCase: ArchiveUserRoleUseCase,
    private readonly restoreDeleteUserRoleUseCase: RestoreDeleteUserRoleUseCase,
    private readonly retrieveComboboxUserRoleUseCase: ComboboxUserRoleUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  async create(
    @Body() createUserRoleDto: CreateUserRoleDto,
    @Request()
    req,
  ) {
    const userName = req.user.userName as string;
    return this.createUserRoleUseCase.execute(createUserRoleDto, userName);
  }

  @Version('1') // API versioning
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
    return await this.findUserRolesWithFiltersUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      isArchived,
    );
  }

  @Version('1') // API versioning
  @Get('combobox')
  async retrieveCombobox() {
    return this.retrieveComboboxUserRoleUseCase.execute();
  }

  @Version('1') // API versioning
  @Delete('delete/:id')
  async delete(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const userName = req.user.userName as string;
    return this.softDeleteUserRoleUseCase.execute(id, userName);
  }

  @Version('1') // API versioning
  @Patch('restore/:id')
  async restore(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const userName = req.user.userName as string;
    return this.restoreDeleteUserRoleUseCase.execute(id, userName);
  }

  @Version('1') // API versioning
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Request()
    req,
  ) {
    const userName = req.user.userName as string;
    return this.updateUserRoleUseCase.execute(id, updateUserRoleDto, userName);
  }
}
