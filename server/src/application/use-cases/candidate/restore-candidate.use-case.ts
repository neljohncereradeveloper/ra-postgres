import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { CANDIDATE_ACTIONS } from '@domain/constants/candidate/candidate-actions.constants';
import { SomethinWentWrongException } from '@domains/exceptions/index';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class RestoreCandidateUseCase {
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

  async execute(id: number, user_name: string): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      CANDIDATE_ACTIONS.RESTORE,
      async (manager) => {
        // retrieve the active election
        const active_election =
          await this.activeElectionRepository.retrieveActiveElection(manager);
        if (!active_election) {
          throw new NotFoundException('No Active election');
        }

        const election = await this.electionRepository.findById(
          active_election.election_id,
          manager,
        );
        if (!election) {
          throw new NotFoundException(
            `Election with ID ${active_election.election_id} not found.`,
          );
        }
        // Can only restore deleted candidate if election is scheduled
        election.validateForUpdate();

        // retrieve the candidate
        const candidate = await this.candidateRepository.findById(id, manager);
        if (!candidate) {
          throw new NotFoundException(`Candidate with ID ${id} not found.`);
        }

        // Use domain method to restore (ensures deletedBy is cleared)
        candidate.restore();

        // Save the restored candidate
        const success = await this.candidateRepository.update(
          id,
          candidate,
          manager,
        );
        if (!success) {
          throw new SomethinWentWrongException(`Candidate restore failed`);
        }

        // Log the restore
        const log = ActivityLog.create({
          action: CANDIDATE_ACTIONS.RESTORE,
          entity: DATABASE_CONSTANTS.MODELNAME_CANDIDATE,
          details: JSON.stringify({
            id,
            display_name: candidate.display_name,
            explanation: `Candidate with ID : ${id} restored by USER : ${user_name}`,
            restored_by: user_name,
            restored_at: getPHDateTime(),
          }),
          user_name: user_name,
        });
        await this.activityLogRepository.create(log, manager);

        return success;
      },
    );
  }
}
