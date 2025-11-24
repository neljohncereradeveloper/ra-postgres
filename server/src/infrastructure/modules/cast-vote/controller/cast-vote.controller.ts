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
import { User } from '@domain/models/user.model';
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
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.CastVoteManagementModule,
  )
  @Post()
  async castVote(
    @Body() castVoteDto: CastVoteDto,
    @Request()
    req,
  ) {
    const user = req.user as User;
    return this.castVoteUseCase.execute(castVoteDto, user);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Precinct)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.CastVoteManagementModule,
  )
  @Get('reprint')
  async reprintCastVote(
    @Query('controlNumber') controlNumber: string,
    @Request()
    req,
  ) {
    const user = req.user as User;
    return this.reprintCastVoteUseCase.execute(controlNumber, user);
  }
}
