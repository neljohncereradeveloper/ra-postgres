import { Inject, Injectable } from '@nestjs/common';
import { PRECINCT_ACTIONS } from '@domain/constants/index';
import { ActivityLog } from '@domain/models/index';
import { TransactionPort } from '@domain/ports/index';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@domains/exceptions/index';
import {
  ActivityLogRepository,
  PrecinctRepository,
  ActiveElectionRepository,
  ElectionRepository,
} from '@domains/repositories/index';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class ArchivePrecinctUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.PRECINCT)
    private readonly precinctRepository: PrecinctRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(id: number, userName: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      PRECINCT_ACTIONS.ARCHIVE,
      async (manager) => {
        // retrieve the active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new NotFoundException('No Active election');
        }

        // retrieve the election
        const election = await this.electionRepository.findById(
          activeElection.electionid,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${activeElection.electionid} not found.`,
          );
        }
        // Use domain model method to validate if election is scheduled
        election.validateForUpdate();

        // Retrieve the precinct
        const precinct = await this.precinctRepository.findById(id, manager);
        if (!precinct) {
          throw new NotFoundException(`Precinct with ID ${id} not found.`);
        }
        // Use domain model method to archive (encapsulates business logic and validation)
        precinct.archive(userName);

        // Update the precinct in the database
        const success = await this.precinctRepository.update(
          id,
          precinct,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException('Precinct archive failed');
        }

        // Log the archive
        const log = ActivityLog.create({
          action: PRECINCT_ACTIONS.ARCHIVE,
          entity: DATABASE_CONSTANTS.MODELNAME_PRECINCT,
          details: JSON.stringify({
            id,
            desc1: precinct.desc1,
            explanation: `Precinct with ID : ${id} archived by USER : ${userName}`,
            archivedBy: userName,
            archivedAt: getPHDateTime(precinct.deletedat),
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
