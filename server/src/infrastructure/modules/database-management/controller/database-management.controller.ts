import {
  Controller,
  Post,
  Version,
  UseGuards,
  Res,
  Req,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import * as fs from 'fs';
import { JwtBearerAuthGuard } from '@infrastructure/modules/auth/guards/jwt-auth.guard';
import { AuthorizeRoles } from '@infrastructure/modules/auth/decorators/roles.decorator';
import { BackupDatabaseUseCase } from '@application/use-cases/database-management/backup-database.use-case';
import { AuthUserRolesEnum } from '@shared/constants/auth.constants';

// Controller for handling client-related requests
@Controller('database-management')
@UseGuards(JwtBearerAuthGuard)
@AuthorizeRoles(AuthUserRolesEnum.Admin)
export class DatabaseManagementController {
  private readonly logger = new Logger('DatabaseManagementController');

  constructor(private readonly backupDatabaseUseCase: BackupDatabaseUseCase) {}

  @Version('1') // API versioning
  @Post('backup')
  async create(@Res() res: Response, @Req() req: Request) {
    const userId = (req.user as any)?.id;
    const filePath = await this.backupDatabaseUseCase.execute(req, userId);

    return res.download(filePath, (err) => {
      if (err) {
        // Handle errors, but don't throw error if it'ss just because the client canceled the download
        if (!res.headersSent) {
          this.logger.log(`Backup database by user:${userId}`);
        }
      } else {
        // File was downloaded successfully, delete it
        fs.unlink(filePath, (err) => {
          if (err) {
            this.logger.error(`Unlink Backup database failed`);
          }
        });
      }
    });
  }
}
