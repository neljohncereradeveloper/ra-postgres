import {
  Injectable,
  Logger,
  HttpException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as fspromise from 'fs/promises';
import * as os from 'os';
import { DatabaseManagementRepository } from '@domains/repositories/database-management.repository';

@Injectable()
export class DatabaseManagementRepositoryTypeormImpl
  implements DatabaseManagementRepository
{
  private readonly logger = new Logger('DatabasemanagementService');

  constructor(private readonly configService: ConfigService) {}

  async performBackup(req: any, userId: number): Promise<string> {
    const pcName = os.hostname();
    const ipAddress = req.ip || null;
    const context = 'DatabaseBackup';

    try {
      // Retrieve environment variables
      const DB_USER = this.configService.get<string>('DB_USERNAME');
      const DB_PASSWORD = this.configService.get<string>('DB_PASSWORD');
      const DB_NAME = this.configService.get<string>('DB_DATABASE');

      if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
        this.logger.error('Database credentials not provided', context);
        throw new BadRequestException('Database credentials are missing.');
      }

      // Generate the backup file path
      const currentDatetime = new Date().toISOString().replace(/[:.]/g, '');
      const backupDirectory = path.join(process.cwd(), 'backup');
      const backupFilePath = path.join(
        backupDirectory,
        `backup_${DB_NAME}_${currentDatetime}.sql`,
      );

      // Ensure the backup directory exists
      if (!fs.existsSync(backupDirectory)) {
        fs.mkdirSync(backupDirectory, { recursive: true });
      }

      // Execute the mysqldump command
      const result = childProcess.spawnSync(
        'mysqldump',
        [
          '-u',
          DB_USER,
          '-p' + DB_PASSWORD,
          DB_NAME,
          `--result-file=${backupFilePath}`,
        ],
        { stdio: 'pipe' },
      );

      // Check if the command failed
      if (result.status !== 0) {
        const errorMessage = result.stderr
          ? result.stderr.toString()
          : 'Unknown error';
        this.logger.error(
          `Backup failed for ${DB_NAME}: ${errorMessage}`,
          context,
        );
        throw new InternalServerErrorException(
          `Database backup failed: ${errorMessage}`,
        );
      }

      // Log successful backup
      const logMessage = `Backed up Database: { database: ${DB_NAME}, pcname: ${pcName}, ipaddress: ${ipAddress}, backup by userid:${userId} }`;
      this.logger.log(logMessage, context);

      return backupFilePath;
    } catch (error) {
      this.logger.error(`Backup operation failed: ${error.message}`, context);
      throw new HttpException(`Backup operation failed: ${error.message}`, 500);
    }
  }

  async performRestore(
    filePath: string,
    username: string,
    req: any,
  ): Promise<{ message: string; statusCode: number }> {
    const pcName = os.hostname();
    const ipAddress = req.ip || null;
    const context = 'DatabaseRestore';

    try {
      // Retrieve environment variables
      const DB_USER = this.configService.get<string>('DB_USER');
      const DB_PASSWORD = this.configService.get<string>('DB_PASSWORD');
      const DB_NAME = this.configService.get<string>('DB_NAME');

      if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
        this.logger.error('Database credentials not provided', context);
        throw new BadRequestException('Database credentials are missing.');
      }

      // Execute the mysql command to restore the database
      const result = childProcess.spawnSync(
        'mysql',
        [
          `-u${DB_USER}`,
          `-p${DB_PASSWORD}`,
          DB_NAME,
          `-e`,
          `source ${filePath}`,
        ],
        { stdio: 'pipe' },
      );

      // Check if the command failed
      if (result.status !== 0) {
        const errorMessage = result.stderr
          ? result.stderr.toString()
          : 'Unknown error';
        this.logger.error(
          `Restore failed for ${DB_NAME}: ${errorMessage}`,
          context,
        );
        throw new InternalServerErrorException(
          `Database restore failed: ${errorMessage}`,
        );
      }

      // Remove the backup file after restoration
      await fspromise.unlink(filePath);

      // Log successful restoration
      const logMessage = `Restored Database: { database: ${DB_NAME}, pcname: ${pcName}, ipaddress: ${ipAddress}, username: ${username} }`;
      this.logger.log(logMessage, context);

      return { message: 'Successful Database Restoration', statusCode: 200 };
    } catch (error) {
      this.logger.error(`Restore operation failed: ${error.message}`, context);
      throw new HttpException(
        `Restore operation failed: ${error.message}`,
        500,
      );
    }
  }
}
