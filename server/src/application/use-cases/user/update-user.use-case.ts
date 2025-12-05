import { UpdateUserCommand } from '@application/commands/user/update-user.command';
import { ActivityLog } from '@domain/models/activitylog.model';
import { User } from '@domain/models/user.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { ApplicationAccessRepository } from '@domains/repositories/application-access.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { UserRoleRepository } from '@domains/repositories/user-role.repository';
import { UserRepository } from '@domains/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { PrecinctRepository } from '@domains/repositories/precinct.repository';
import { USER_ACTIONS } from '@domain/constants/user/user-actions.constants';
import {
  BadRequestException,
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';
import { getPHDateTime } from '@domain/utils/format-ph-time';

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
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateUserCommand,
    username: string,
  ): Promise<User> {
    return this.transactionHelper.executeTransaction(
      USER_ACTIONS.UPDATE,
      async (manager) => {
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }

        const election = await this.electionRepository.findById(
          activeElection.electionId,
          manager,
        );
        // Can only UPDATE user if election is schedule
        election.validateForUpdate();

        const precinct = await this.precinctRepository.findByDescription(
          dto.precinct,
          manager,
        );
        if (!precinct) {
          throw new NotFoundException('Precinct not found');
        }

        /** validate roles if exist */
        const userRolesPromises = dto.userRoles.map(async (role) => {
          // validate role
          const userRole = await this.userRoleRepository.findByDesc(role.trim());
          if (!userRole) {
            throw new NotFoundException(`Role ${role} not found`);
          }
        });
        // Execute all promises concurrently using Promise.all.
        await Promise.all(userRolesPromises);

        const applicationAccessPromises = dto.applicationAccess.map(
          async (value) => {
            // validate application access
            const applicationAccess =
              await this.applicationAccessRepository.findByDesc(value.trim());
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
        const userResult = await this.userRepository.findById(id, manager);
        if (!userResult) {
          throw new NotFoundException('User not found');
        }

        // use domain model method to update (encapsulates business logic and validation)
        userResult.update({
          precinct: dto.precinct,
          watcher: dto.watcher,
          applicationAccess: dto.applicationAccess,
          userRoles: dto.userRoles,
          updatedBy: username,
        });
        const updateSuccessfull = await this.userRepository.update(
          id,
          userResult,
          manager,
        );

        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('User update failed');
        }

        const updateResult = await this.userRepository.findById(id, manager);

        // Log the update
        const log = ActivityLog.create({
          action: USER_ACTIONS.UPDATE,
          entity: DATABASE_CONSTANTS.MODELNAME_USER,
          details: JSON.stringify({
            id: updateResult.id,
            userName: updateResult.userName,
            precinct: updateResult.precinct,
            watcher: updateResult.watcher,
            applicationAccess: updateResult.applicationAccess,
            userRoles: updateResult.userRoles,
            updatedBy: username,
            updatedAt: getPHDateTime(updateResult.updatedAt),
          }),
          username: username,
        });
        await this.activityLogRepository.create(log, manager);

        return updateResult;
      },
    );
  }
}
