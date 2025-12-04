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

  async execute(dto: CreateUserCommand, username: string): Promise<User> {
    return this.transactionHelper.executeTransaction(
      USER_ACTIONS.CREATE,
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

        const hassPassword = await this.passwordEncryptionPort.hash(
          dto.password,
        );

        // use domain model method to create (encapsulates business logic and validation)
        const user = User.create({
          precinct: dto.precinct,
          watcher: dto.watcher,
          applicationAccess: dto.applicationAccess,
          userRoles: dto.userRoles,
          userName: dto.userName,
          password: hassPassword,
          createdBy: username,
        });
        const createdUser = await this.userRepository.create(user, manager);

        // Log the creation
        const log = ActivityLog.create({
          action: USER_ACTIONS.CREATE,
          entity: DATABASE_CONSTANTS.MODELNAME_USER,
          details: JSON.stringify({
            id: createdUser.id,
            userName: createdUser.userName,
            precinct: createdUser.precinct,
            watcher: createdUser.watcher,
            applicationAccess: createdUser.applicationAccess,
            userRoles: createdUser.userRoles,
            createdBy: username,
            createdAt: getPHDateTime(createdUser.createdAt),
          }),
          username: username,
        });
        await this.activityLogRepository.create(log, manager);

        return createdUser;
      },
    );
  }
}
