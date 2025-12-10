import { ActivityLog } from '@domain/models/activitylog.model';
import { TransactionPort } from '@domain/ports/transaction-port';
import { NotFoundException } from '@domains/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@domains/exceptions/shared/something-wentwrong.exception';
import { ActivityLogRepository } from '@domains/repositories/activity-log.repository';
import { PositionRepository } from '@domains/repositories/position.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONSTANTS } from '@shared/constants/database.constants';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { UpdateCandidateCommand } from '@application/commands/candidate/update-candidate.command';
import { Candidate } from '@domain/models/candidate.model';
import { DistrictRepository } from '@domains/repositories/district.repository';
import { DelegateRepository } from '@domains/repositories/delegate.repository';
import { ElectionRepository } from '@domains/repositories/election.repository';
import { CANDIDATE_ACTIONS } from '@domain/constants/candidate/candidate-actions.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

@Injectable()
export class UpdateCandidateUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.CANDIDATE)
    private readonly candidateRepository: CandidateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.POSITION)
    private readonly positionRepository: PositionRepository,
    @Inject(REPOSITORY_TOKENS.DISTRICT)
    private readonly districtRepository: DistrictRepository,
    @Inject(REPOSITORY_TOKENS.DELEGATE)
    private readonly delegateRepository: DelegateRepository,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateCandidateCommand,
    userName: string,
  ): Promise<Candidate> {
    return this.transactionHelper.executeTransaction(
      CANDIDATE_ACTIONS.UPDATE,
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
        // Can only update candidate if election is scheduled
        election.validateForUpdate();

        const delegate = await this.delegateRepository.findById(
          dto.delegateId,
          manager,
        );
        if (!delegate) {
          throw new NotFoundException('Delegate not found');
        }

        const position = await this.positionRepository.findByDescription(
          dto.position,
          election.id,
          manager,
        );
        if (!position) {
          throw new NotFoundException('Position not found');
        }

        const district = await this.districtRepository.findByDescription(
          dto.district,
          election.id,
          manager,
        );
        if (!district) {
          throw new NotFoundException('District not found');
        }

        // retrieve the candidate
        const candidate = await this.candidateRepository.findById(id, manager);
        if (!candidate) {
          throw new NotFoundException('Candidate not found');
        }

        candidate.update({
          displayname: dto.displayName,
          updatedby: userName,
          positionid: position.id,
          districtid: district.id,
        });

        // update the candidate in the database
        const updateSuccessfull = await this.candidateRepository.update(
          id,
          candidate,
          manager,
        );

        if (!updateSuccessfull) {
          throw new SomethinWentWrongException('Candidate update failed');
        }

        const updateResult = await this.candidateRepository.findById(
          id,
          manager,
        );

        // Log the update
        const log = ActivityLog.create({
          action: CANDIDATE_ACTIONS.UPDATE,
          entity: DATABASE_CONSTANTS.MODELNAME_CANDIDATE,
          details: JSON.stringify({
            id: updateResult.id,
            election: election.name,
            displayName: updateResult.displayname,
            position: position.desc1,
            district: district.desc1,
            delegate: delegate.accountname,
            updatedBy: userName,
            updatedAt: getPHDateTime(updateResult.updatedat),
          }),
          username: userName,
        });
        await this.activityLogRepository.create(log, manager);

        return updateResult;
      },
    );
  }
}
