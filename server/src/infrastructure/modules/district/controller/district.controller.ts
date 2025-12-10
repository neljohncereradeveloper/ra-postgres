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
import { CreateDistrictUseCase } from '@application/use-cases/district/create-district.use-case';
import { CreateDistrictDto } from '../interface/dto/create-district.dto';
import { UpdateDistrictDto } from '../interface/dto/update-district.dto';
import { UpdateDistrictUseCase } from '@application/use-cases/district/update-district.use-case';
import { PaginatedDistrictsListUseCase } from '@application/use-cases/district/paginated-district-list.use-case';
import { ArchiveDistrictUseCase } from '@application/use-cases/district/archive-district.use-case';
import { RestoreDistrictUseCase } from '@application/use-cases/district/restore-district.use-case';
import { ComboboxDistrictUseCase } from '@application/use-cases/district/combobox-district.use-case';
import { JwtBearerAuthGuard } from '@infrastructure/modules/auth/guards/jwt-auth.guard';
import { AuthorizeRoles } from '@infrastructure/modules/auth/decorators/roles.decorator';
import {
  AuthApplicationAccessEnum,
  AuthUserRolesEnum,
} from '@shared/constants/auth.constants';
import { AuthorizeApplicationAccess } from '@infrastructure/modules/auth/decorators/applicationaccess.decorator';

// Controller for handling client-related requests
@Controller('districts')
@UseGuards(JwtBearerAuthGuard)
export class DistrictController {
  constructor(
    private readonly createDistrictUseCase: CreateDistrictUseCase,
    private readonly updateDistrictUseCase: UpdateDistrictUseCase,
    private readonly findDistrictsWithFiltersUseCase: PaginatedDistrictsListUseCase,
    private readonly softDeleteDistrictUseCase: ArchiveDistrictUseCase,
    private readonly restoreDeleteDistrictUseCase: RestoreDistrictUseCase,
    private readonly retrieveComboboxDistrictUseCase: ComboboxDistrictUseCase,
  ) {}

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
  @Post()
  async create(
    @Body() createDistrictDto: CreateDistrictDto,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.createDistrictUseCase.execute(createDistrictDto, user_name);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
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
    return await this.findDistrictsWithFiltersUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      is_archived,
    );
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin, AuthUserRolesEnum.Precinct)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
  @Get('combobox')
  async retrieveCombobox() {
    return this.retrieveComboboxDistrictUseCase.execute();
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
  @Delete('delete/:id')
  async delete(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.softDeleteDistrictUseCase.execute(id, user_name);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
  @Patch('restore/:id')
  async restore(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.restoreDeleteDistrictUseCase.execute(id, user_name);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDistrictDto: UpdateDistrictDto,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.updateDistrictUseCase.execute(id, updateDistrictDto, user_name);
  }
}
