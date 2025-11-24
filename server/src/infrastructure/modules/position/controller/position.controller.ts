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
import { CreatePositionUseCase } from '@application/use-cases/position/create-position.use-case';
import { SoftDeletePositionUseCase } from '@application/use-cases/position/soft-delete-position.use-case';
import { RestoreDeletePositionUseCase } from '@application/use-cases/position/restore-delete-position.use-case';
import { RetrieveComboboxPositionUseCase } from '@application/use-cases/position/retrieve-combobox-position.use-case';
import { UpdatePositionUseCase } from '@application/use-cases/position/update-position.use-case';
import { FindPositionsWithFiltersUseCase } from '@application/use-cases/position/find-with-filters-position.use-case';
import { CreatePositionDto } from '../interface/dto/create-position.dto';
import { UpdatePositionDto } from '../interface/dto/update-position.dto';
// Controller for handling client-related requests
@Controller('positions')
@UseGuards(JwtBearerAuthGuard)
export class PositionController {
  constructor(
    private readonly createPositionUseCase: CreatePositionUseCase,
    private readonly updatePositionUseCase: UpdatePositionUseCase,
    private readonly findPositionsWithFiltersUseCase: FindPositionsWithFiltersUseCase,
    private readonly softDeletePositionUseCase: SoftDeletePositionUseCase,
    private readonly restoreDeletePositionUseCase: RestoreDeletePositionUseCase,
    private readonly retrieveComboboxPositionUseCase: RetrieveComboboxPositionUseCase,
  ) {}

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Post()
  async create(
    @Body() createPositionDto: CreatePositionDto,
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.createPositionUseCase.execute(createPositionDto, userId);
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
    return await this.findPositionsWithFiltersUseCase.execute(
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
    return this.retrieveComboboxPositionUseCase.execute();
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
    return this.softDeletePositionUseCase.execute(id, userId);
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
    return this.restoreDeletePositionUseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePositionDto: UpdatePositionDto,
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.updatePositionUseCase.execute(id, updatePositionDto, userId);
  }
}
