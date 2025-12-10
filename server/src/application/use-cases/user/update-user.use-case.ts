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
    user_name: string,
  ): Promise<User> {
    return this.transactionHelper.executeTransaction(
      USER_ACTIONS.UPDATE,
      async (manager) => {
        const active_election =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!active_election) {
          throw new BadRequestException('No Active election');
        }

        const election = await this.electionRepository.findById(
          active_election.election_id,
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
        const user_roles_promises = dto.user_roles.map(async (role) => {
          // validate role
          const user_role = await this.userRoleRepository.findByDesc(
            role.trim(),
          );
          if (!user_role) {
            throw new NotFoundException(`Role ${role} not found`);
          }
        });
        // Execute all promises concurrently using Promise.all.
        await Promise.all(user_roles_promises);

        const application_access_promises = dto.application_access.map(
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
        await Promise.all(application_access_promises);

        // validate user existence
        const user_result = await this.userRepository.findById(id, manager);
        if (!user_result) {
          throw new NotFoundException('User not found');
        }

        // use domain model method to update (encapsulates business logic and validation)
        user_result.update({
          precinct: dto.precinct,
          watcher: dto.watcher,
          application_access: dto.application_access,
          user_roles: dto.user_roles,
          updated_by: user_name,
        });
        const update_successful = await this.userRepository.update(
          id,
          user_result,
          manager,
        );

        if (!update_successful) {
          throw new SomethinWentWrongException('User update failed');
        }

        const update_result = await this.userRepository.findById(id, manager);

        // Log the update
        const log = ActivityLog.create({
          action: USER_ACTIONS.UPDATE,
          entity: DATABASE_CONSTANTS.MODELNAME_USER,
          details: JSON.stringify({
            id: update_result.id,
            user_name: update_result.user_name,
            precinct: update_result.precinct,
            watcher: update_result.watcher,
            application_access: update_result.application_access,
            user_roles: update_result.user_roles,
            updated_by: user_name,
            updated_at: getPHDateTime(update_result.updated_at),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return update_result;
      },
    );
  }
}
