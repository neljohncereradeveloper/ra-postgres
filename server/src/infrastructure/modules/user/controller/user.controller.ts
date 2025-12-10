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
import { CreateUserUseCase } from '@application/use-cases/user/create-user.use-case';
import { CreateUserDto } from '../interface/dto/create-user.dto';
import { UpdateUserDto } from '../interface/dto/update-user.dto';
import { UpdateUserUseCase } from '@application/use-cases/user/update-user.use-case';
import { PaginatedUserListUseCase } from '@application/use-cases/user/paginated-user-list.use-case';
import { ArchiveUserUseCase } from '@application/use-cases/user/archive-user.use-case';
import { RestoreDeleteUserUseCase } from '@application/use-cases/user/restore-user.use-case';
import { JwtBearerAuthGuard } from '@infrastructure/modules/auth/guards/jwt-auth.guard';
import { AuthorizeRoles } from '@infrastructure/modules/auth/decorators/roles.decorator';
import {
  AuthApplicationAccessEnum,
  AuthUserRolesEnum,
} from '@shared/constants/auth.constants';
import { AuthorizeApplicationAccess } from '@infrastructure/modules/auth/decorators/applicationaccess.decorator';

// Controller for handling client-related requests
@Controller('users')
@UseGuards(JwtBearerAuthGuard)
@AuthorizeRoles(AuthUserRolesEnum.Admin)
@AuthorizeApplicationAccess(AuthApplicationAccessEnum.AdminModule)
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly findUsersWithFiltersUseCase: PaginatedUserListUseCase,
    private readonly softDeleteUserUseCase: ArchiveUserUseCase,
    private readonly restoreDeleteUserUseCase: RestoreDeleteUserUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.createUserUseCase.execute(createUserDto, user_name);
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
    return await this.findUsersWithFiltersUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      is_archived,
    );
  }

  @Version('1') // API versioning
  @Delete('delete/:id')
  async delete(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.softDeleteUserUseCase.execute(id, user_name);
  }

  @Version('1') // API versioning
  @Patch('restore/:id')
  async restore(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.restoreDeleteUserUseCase.execute(id, user_name);
  }

  @Version('1') // API versioning
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.updateUserUseCase.execute(id, updateUserDto, user_name);
  }
}
