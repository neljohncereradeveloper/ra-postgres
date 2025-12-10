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
import { PaginatedCandidateListUseCase } from '@application/use-cases/candidate/paginated-candidate-list.use-case';
import { ArchiveCandidateUseCase } from '@application/use-cases/candidate/archive-candidate.use-case';
import { RestoreCandidateUseCase } from '@application/use-cases/candidate/restore-candidate.use-case';
import { CreateCandidateDto } from '../interface/dto/create-candidate.dto';
import { GetElectionCandidatesUseCase } from '@application/use-cases/candidate/get-election-candidates';
// Controller for handling client-related requests
@Controller('candidates')
@UseGuards(JwtBearerAuthGuard)
export class CandidateController {
  constructor(
    private readonly createCandidateUseCase: CreateCandidateUseCase,
    private readonly updateCandidateUseCase: UpdateCandidateUseCase,
    private readonly paginatedCandidateListUseCase: PaginatedCandidateListUseCase,
    private readonly archiveCandidateUseCase: ArchiveCandidateUseCase,
    private readonly restoreCandidateUseCase: RestoreCandidateUseCase,
    private readonly getElectionCandidatesUseCase: GetElectionCandidatesUseCase,
  ) {}

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
  @Post()
  async create(
    @Body() createCandidateDto: CreateCandidateDto,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.createCandidateUseCase.execute(createCandidateDto, user_name);
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
    return await this.paginatedCandidateListUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      is_archived,
    );
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Precinct)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.CastVoteModule)
  @Get('cast-vote')
  async getElectionCandidates() {
    // Execute the use case
    return await this.getElectionCandidatesUseCase.execute();
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
    return this.archiveCandidateUseCase.execute(id, user_name);
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
    return this.restoreCandidateUseCase.execute(id, user_name);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.updateCandidateUseCase.execute(
      id,
      updateCandidateDto,
      user_name,
    );
  }
}
