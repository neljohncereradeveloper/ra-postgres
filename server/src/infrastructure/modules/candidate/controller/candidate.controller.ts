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
import { UpdateCandidateDto } from '../interface/dto/update-candidate.dto';
import { CreateCandidateUseCase } from '@application/use-cases/candidate/create-candidate.use-case';
import { UpdateCandidateUseCase } from '@application/use-cases/candidate/update-candidate.use-case';
import { FindCandidatesWithFiltersUseCase } from '@application/use-cases/candidate/find-with-filters-candidate.use-case';
import { SoftDeleteCandidateUseCase } from '@application/use-cases/candidate/soft-delete-candidate.use-case';
import { RestoreDeleteCandidateUseCase } from '@application/use-cases/candidate/restore-delete-candidate.use-case';
import { CreateCandidateDto } from '../interface/dto/create-candidate.dto';
import { GetCastVoteCandidatesUseCase } from '@application/use-cases/candidate/get-cast-vote-candidates';
// Controller for handling client-related requests
@Controller('candidates')
@UseGuards(JwtBearerAuthGuard)
export class CandidateController {
  constructor(
    private readonly createCandidateUseCase: CreateCandidateUseCase,
    private readonly updateCandidateUseCase: UpdateCandidateUseCase,
    private readonly findCandidatesWithFiltersUseCase: FindCandidatesWithFiltersUseCase,
    private readonly softDeleteCandidateUseCase: SoftDeleteCandidateUseCase,
    private readonly restoreDeleteCandidateUseCase: RestoreDeleteCandidateUseCase,
    private readonly getCastVoteCandidatesUseCase: GetCastVoteCandidatesUseCase,
  ) {}

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Post()
  async create(
    @Body() createCandidateDto: CreateCandidateDto,
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.createCandidateUseCase.execute(createCandidateDto, userId);
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
    return await this.findCandidatesWithFiltersUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      isDeleted,
    );
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Precinct)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.CastVoteManagementModule,
  )
  @Get('cast-vote')
  async getCastVoteCandidates() {
    // Execute the use case
    return await this.getCastVoteCandidatesUseCase.execute();
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
    return this.softDeleteCandidateUseCase.execute(id, userId);
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
    return this.restoreDeleteCandidateUseCase.execute(id, userId);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @Request()
    req,
  ) {
    const userId = req.user.id as number;
    return this.updateCandidateUseCase.execute(id, updateCandidateDto, userId);
  }
}
