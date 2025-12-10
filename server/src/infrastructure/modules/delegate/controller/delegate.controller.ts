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
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDelegates(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const user_name = req.user.user_name as string;
    const uploadedFileInput = {
      original_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    };
    return await this.uploadDelegatesFileUseCase.execute(
      uploadedFileInput,
      user_name,
    );
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.ElectionModule)
  @Get('active-election')
  async findWithElectionIdFilters(
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
    return await this.findDelegatesWithElectionIdFiltersUseCase.execute(
      term || '',
      parsedPage,
      parsedLimit,
      is_archived,
    );
  }

  @Version('1') // API versioning
  @AuthorizeRoles(AuthUserRolesEnum.Admin, AuthUserRolesEnum.Precinct)
  @AuthorizeApplicationAccess(AuthApplicationAccessEnum.CastVoteModule)
  @Get('control-number/:control_number')
  async findByControlNumber(@Param('control_number') control_number: string) {
    return await this.findDelegatesWithElectionIdAndControlNumberUseCase.execute(
      control_number,
    );
  }
}
