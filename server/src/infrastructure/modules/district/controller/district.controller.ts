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
import { FindDistrictsWithFiltersUseCase } from '@application/use-cases/district/find-with-filters-district.use-case';
import { SoftDeleteDistrictUseCase } from '@application/use-cases/district/soft-delete-district.use-case';
import { RestoreDeleteDistrictUseCase } from '@application/use-cases/district/restore-delete-district.use-case';
import { RetrieveComboboxDistrictUseCase } from '@application/use-cases/district/retrieve-combobox-district.use-case';
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
    private readonly findDistrictsWithFiltersUseCase: FindDistrictsWithFiltersUseCase,
    private readonly softDeleteDistrictUseCase: SoftDeleteDistrictUseCase,
    private readonly restoreDeleteDistrictUseCase: RestoreDeleteDistrictUseCase,
    private readonly retrieveComboboxDistrictUseCase: RetrieveComboboxDistrictUseCase,
  ) {}

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Post()
  async create(
    @Body() createDistrictDto: CreateDistrictDto,
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.createDistrictUseCase.execute(createDistrictDto, userId);
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
    return await this.findDistrictsWithFiltersUseCase.execute(
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
    return this.retrieveComboboxDistrictUseCase.execute();
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
    return this.softDeleteDistrictUseCase.execute(id, userId);
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
    return this.restoreDeleteDistrictUseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDistrictDto: UpdateDistrictDto,
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.updateDistrictUseCase.execute(id, updateDistrictDto, userId);
  }
}
