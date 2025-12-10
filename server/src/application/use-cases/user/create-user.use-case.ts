import { CreateUserCommand } from '@application/commands/user/create-user.command';
import { ActivityLog } from '@domain/models/activitylog.model';
import { User } from '@domain/models/user.model';
import { PasswordEncryptionPort } from '@domain/ports/password-encryption.port';
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
import { getPHDateTime } from '@domain/utils/format-ph-time';
import {
  BadRequestException,
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.PASSWORDENCRYPTIONPORT)
    private readonly passwordEncryptionPort: PasswordEncryptionPort,
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

  async execute(dto: CreateUserCommand, user_name: string): Promise<User> {
    return this.transactionHelper.executeTransaction(
      USER_ACTIONS.CREATE,
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
        // Can only add user if election is scheduled
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
          const userRole = await this.userRoleRepository.findByDesc(
            role.trim(),
          );
          if (!userRole) {
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

        const hassPassword = await this.passwordEncryptionPort.hash(
          dto.password,
        );

        // use domain model method to create (encapsulates business logic and validation)
        const user = User.create({
          precinct: dto.precinct,
          watcher: dto.watcher,
          application_access: dto.application_access,
          user_roles: dto.user_roles,
          user_name: dto.user_name,
          password: hassPassword,
          created_by: user_name,
        });
        const created_user = await this.userRepository.create(user, manager);

        if (!created_user) {
          throw new SomethinWentWrongException('User creation failed');
        }

        // Log the creation
        const log = ActivityLog.create({
          action: USER_ACTIONS.CREATE,
          entity: DATABASE_CONSTANTS.MODELNAME_USER,
          details: JSON.stringify({
            id: created_user.id,
            user_name: created_user.user_name,
            precinct: created_user.precinct,
            watcher: created_user.watcher,
            application_access: created_user.application_access,
            user_roles: created_user.user_roles,
            created_by: user_name,
            created_at: getPHDateTime(created_user.created_at),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return created_user;
      },
    );
  }
}
