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
import { FindUsersWithFiltersUseCase } from '@application/use-cases/user/find-with-filters-user.use-case';
import { SoftDeleteUserUseCase } from '@application/use-cases/user/soft-delete-user.use-case';
import { RestoreDeleteUserUseCase } from '@application/use-cases/user/restore-delete-user.use-case';
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
    private readonly findUsersWithFiltersUseCase: FindUsersWithFiltersUseCase,
    private readonly softDeleteUserUseCase: SoftDeleteUserUseCase,
    private readonly restoreDeleteUserUseCase: RestoreDeleteUserUseCase,
  ) {}

  @Version('1') // API versioning
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.createUserUseCase.execute(createUserDto, userId);
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
    return await this.findUsersWithFiltersUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      isDeleted,
    );
  }

  @Version('1') // API versioning
  @Delete('delete/:id')
  async delete(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.softDeleteUserUseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @Patch('restore/:id')
  async restore(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.restoreDeleteUserUseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request()
    req,
  ) {
    const userId = req.user.id;
    return this.updateUserUseCase.execute(id, updateUserDto, userId);
  }
}
