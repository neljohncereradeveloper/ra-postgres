import { UpdateUserCommand } from '@application/commands/user/update-user.command';
import { ActivityLog } from '@domain/models/activitylog,model';
import { User } from '@domain/models/user.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { SettingsRepository } from '@domains/repositories/setting.repository';
import { UserRoleRepository } from '@domains/repositories/user-role.repository';
import { UserRepository } from '@domains/repositories/user.repository';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PrecinctRepository } from '@domains/repositories/precinct.repository';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORY_TOKENS.USERROLE)
    private readonly userRoleRepository: UserRoleRepository,
    @Inject(REPOSITORY_TOKENS.APPLICATIONACCESS)
    private readonly applicationAccessRepository: ApplicationAccessRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
    @Inject(REPOSITORY_TOKENS.SETTING)
    private readonly settingsRepository: SettingsRepository,
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateUserCommand,
    userId: number,
  ): Promise<User> {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.UPDATE_USER,
      async (manager) => {
        const activeElection =
          await this.settingsRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }

        const election = await this.electionRepository.findById(
          activeElection.electionId,
          manager,
        );
        // Can only add user if election is schedule
        election.validate();

        const precinct = await this.precinctRepository.findByDescription(
          dto.precinct,
          manager,
        );
        if (!precinct) {
          throw new NotFoundException('Precinct not found');
        }

        /** validate roles if exist */
        const userRolesArray = dto.userRoles.split(',');
        const userRolesPromises = userRolesArray.map(async (role) => {
          // validate role
          const userRole = await this.userRoleRepository.findByDesc(role);
          if (!userRole) {
            throw new NotFoundException(`Role ${role} not found`);
          }
        });
        // Execute all promises concurrently using Promise.all.
        await Promise.all(userRolesPromises);

        const applicationAccessArray = dto.applicationAccess.split(',');
        const applicationAccessPromises = applicationAccessArray.map(
          async (value) => {
            // validate role
            const applicationAccess =
              await this.applicationAccessRepository.findByDesc(value);
            if (!applicationAccess) {
              throw new NotFoundException(
                `Application Access ${value} not found`,
              );
            }
          },
        );
        // Execute all promises concurrently using Promise.all.
        await Promise.all(applicationAccessPromises);

        // validate user existence
        const userResult = await this.userRepository.findByIdWithManager(
          id,
          manager,
        );
        if (!userResult) {
          throw new NotFoundException('User not found');
        }

        // Update the user
        const user = new User({
          precinct: dto.precinct,
          watcher: dto.watcher,
          applicationAccess: dto.applicationAccess,
          userRoles: dto.userRoles,
        });
        const updateSuccessfull = await this.userRepository.updateWithManager(
          id,
          user,
          manager,
        );

        if (!updateSuccessfull) {
          throw new InternalServerErrorException('User update failed');
        }

        const updateResult = await this.userRepository.findByIdWithManager(
          id,
          manager,
        );
        // Log the creation
        const log = new ActivityLog(
          LOG_ACTION_CONSTANTS.UPDATE_USER,
          DATABASE_CONSTANTS.MODELNAME_USER,
          JSON.stringify({
            id: updateResult.id,
            watcher: dto.watcher,
            precinct: dto.precinct,
            applicationAccess: dto.applicationAccess,
            userRoles: dto.userRoles,
          }),
          new Date(),
          userId,
        );
        // insert log
        await this.activityLogRepository.create(log, manager);

        return updateResult;
      },
    );
  }
}
