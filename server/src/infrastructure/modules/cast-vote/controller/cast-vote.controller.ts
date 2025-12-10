import {
  Controller,
  Post,
  Body,
  Version,
  UseGuards,
  Request,
  Query,
  Get,
} from '@nestjs/common';
import { JwtBearerAuthGuard } from '@infrastructure/modules/auth/guards/jwt-auth.guard';
import { AuthorizeRoles } from '@infrastructure/modules/auth/decorators/roles.decorator';
import {
  AuthApplicationAccessEnum,
  AuthUserRolesEnum,
} from '@shared/constants/auth.constants';
import { AuthorizeApplicationAccess } from '@infrastructure/modules/auth/decorators/applicationaccess.decorator';
import { CastVoteDto } from '../interface/dto/cast-vote.dto';
import { CastVoteUseCase } from '@application/use-cases/cast-vote/cast-vote.use-case';
import { ReprintCastVoteUseCase } from '@application/use-cases/cast-vote/reprint-case-vote.use-case';

@Controller('cast-vote')
@UseGuards(JwtBearerAuthGuard)
export class CastVoteController {
  constructor(
    private readonly castVoteUseCase: CastVoteUseCase,
    private readonly reprintCastVoteUseCase: ReprintCastVoteUseCase,
  ) {}

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Precinct)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.CastVoteModule)
  @Post()
  async castVote(
    @Body() castVoteDto: CastVoteDto,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    const precinct = req.user.precinct as string;
    return this.castVoteUseCase.execute(
      castVoteDto,
      user_name,
      precinct as string,
    );
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Precinct)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.CastVoteModule)
  @Get('reprint')
  async reprintCastVote(
    @Query('control_number') control_number: string,
    @Request()
    req,
  ) {
    const user_name = req.user.user_name as string;
    return this.reprintCastVoteUseCase.execute(control_number, user_name);
  }
}
