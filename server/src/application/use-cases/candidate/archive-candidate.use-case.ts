import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { CANDIDATE_ACTIONS } from '@domain/constants/candidate/candidate-actions.constants';
import { SomethinWentWrongException } from '@domains/exceptions/index';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class ArchiveCandidateUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.CANDIDATE)
    private readonly candidateRepository: CandidateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(id: number, userName: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      CANDIDATE_ACTIONS.ARCHIVE,
      async (manager) => {
        // retrieve the active election
        const activeElection =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new NotFoundException('No Active election');
        }
        const election = await this.electionRepository.findById(
          activeElection.electionId,
          manager,
        );
        // retrieve the election
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${activeElection.electionId} not found.`,
          );
        }
        // Use domain model method to validate if election is scheduled
        election.validateForUpdate();

        // Retrieve the candidate
        const candidate = await this.candidateRepository.findById(id, manager);
        if (!candidate) {
          throw new NotFoundException(`Candidate with ID ${id} not found.`);
        }

        // Use domain method to archive (soft delete)
        candidate.archive(userName);

        // Save the updated candidate
        const success = await this.candidateRepository.update(
          id,
          candidate,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(`Candidate archive failed`);
        }

        // Log the archive
        const log = ActivityLog.create({
          action: CANDIDATE_ACTIONS.ARCHIVE,
          entity: DATABASE_CONSTANTS.MODELNAME_CANDIDATE,
          details: JSON.stringify({
            id,
            displayName: candidate.displayName,
            explanation: `Candidate with ID : ${id} archived by USER : ${userName}`,
            archivedBy: userName,
            archivedAt: getPHDateTime(candidate.deletedAt),
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
