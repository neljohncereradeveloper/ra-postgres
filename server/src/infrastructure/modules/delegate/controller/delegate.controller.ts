import {
  Controller,
  Post,
  Version,
  Param,
  Query,
  Get,
  BadRequestException,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { JwtBearerAuthGuard } from '@infrastructure/modules/auth/guards/jwt-auth.guard';
import { AuthorizeRoles } from '@infrastructure/modules/auth/decorators/roles.decorator';
import {
  AuthApplicationAccessEnum,
  AuthUserRolesEnum,
} from '@shared/constants/auth.constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDelegatesUseCase } from '@application/use-cases/delegate/upload-delegates.use-case';
import { AuthorizeApplicationAccess } from '@infrastructure/modules/auth/decorators/applicationaccess.decorator';
import { PaginatedDelegateListUseCase } from '@application/use-cases/delegate/paginated-delegate-list.use-case';
import { FindByControllNumberUseCase } from '@application/use-cases/delegate/find-by-controll-number.use-case';

// Controller for handling client-related requests
@Controller('delegates')
@UseGuards(JwtBearerAuthGuard)
export class DelegateController {
  constructor(
    private readonly uploadDelegatesFileUseCase: UploadDelegatesUseCase,
    private readonly findDelegatesWithElectionIdFiltersUseCase: PaginatedDelegateListUseCase,
    private readonly findDelegatesWithElectionIdAndControlNumberUseCase: FindByControllNumberUseCase,
  ) {}

  @Version('1')
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDelegates(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const userName = req.user.userName as string;
    return await this.uploadDelegatesFileUseCase.execute(file, userName);
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.ElectionManagementModule,
  )
  @Get('active-election')
  async findWithElectionIdFilters(
    @Query('term') term: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('isArchived') isArchived: boolean,
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
    return await this.findDelegatesWithElectionIdFiltersUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      isArchived,
    );
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin, AuthUserRolesEnum.Precinct)
  @AuthorizeApplicationAccess(
    AuthApplicationAccessEnum.CastVoteManagementModule,
  )
  @Get('control-number/:controlNumber')
  async findByControlNumber(@Param('controlNumber') controlNumber: string) {
    return await this.findDelegatesWithElectionIdAndControlNumberUseCase.execute(
      controlNumber,
    );
  }
}
