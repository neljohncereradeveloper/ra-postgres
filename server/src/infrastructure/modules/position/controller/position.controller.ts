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
import { ArchivePositionUseCase } from '@application/use-cases/position/archive-position.use-case';
import { RestorePositionUseCase } from '@application/use-cases/position/restore-position.use-case';
import { ComboboxPositionUseCase } from '@application/use-cases/position/combobox-position.use-case';
import { UpdatePositionUseCase } from '@application/use-cases/position/update-position.use-case';
import { PaginatedPositionsListUseCase } from '@application/use-cases/position/paginated-position-list.use-case';
import { CreatePositionDto } from '../interface/dto/create-position.dto';
import { UpdatePositionDto } from '../interface/dto/update-position.dto';
// Controller for handling client-related requests
@Controller('positions')
@UseGuards(JwtBearerAuthGuard)
export class PositionController {
  constructor(
    private readonly createPositionUseCase: CreatePositionUseCase,
    private readonly updatePositionUseCase: UpdatePositionUseCase,
    private readonly paginatedPositionsListUseCase: PaginatedPositionsListUseCase,
    private readonly archivePositionUseCase: ArchivePositionUseCase,
    private readonly restorePositionUseCase: RestorePositionUseCase,
    private readonly comboboxPositionUseCase: ComboboxPositionUseCase,
  ) {}

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
  @Post()
  async create(
    @Body() createPositionDto: CreatePositionDto,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.createPositionUseCase.execute(createPositionDto, user_name);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
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
    return await this.paginatedPositionsListUseCase.execute(
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
  async combobox() {
    return this.comboboxPositionUseCase.execute();
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
  @Delete('archive/:id')
  async archive(
    @Param('id') id: number,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.archivePositionUseCase.execute(id, user_name);
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
    return this.restorePositionUseCase.execute(id, user_name);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePositionDto: UpdatePositionDto,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.updatePositionUseCase.execute(id, updatePositionDto, user_name);
  }
}
