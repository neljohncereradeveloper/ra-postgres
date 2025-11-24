import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { LOG_ACTION_CONSTANTS } from '@shared/constants/log-action.constants';
import { SettingsRepository } from '@domains/repositories/setting.repository';
import { TransactionPort } from '@domain/ports/transaction-port';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class GetCastVoteCandidatesUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.CANDIDATE)
    private readonly candidateRepository: CandidateRepository,
    @Inject(REPOSITORY_TOKENS.SETTING)
    private readonly settingsRepository: SettingsRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
  ) {}

  async execute() {
    return this.transactionHelper.executeTransaction(
      LOG_ACTION_CONSTANTS.RETRIEVE_CAST_VOTE_CANDIDATES,
      async (manager) => {
        const activeElection =
          await this.settingsRepository.retrieveActiveElection(manager);
        if (!activeElection) {
          throw new BadRequestException('No Active election');
        }

        // Call the repository method to get filtered data
        const result = await this.candidateRepository.getCastVoteCandidates(
          activeElection.electionId,
          manager,
        );

        // Group candidates by position
        const grouped = result.reduce((acc: any[], curr: any) => {
          // Find if this position already exists in acc
          let group = acc.find(
            (g) =>
              g.position === curr.position &&
              g.positionMaxCandidates === curr.positionMaxCandidates &&
              g.positionTermLimit === curr.positionTermLimit,
          );
          if (!group) {
            group = {
              position: curr.position,
              positionMaxCandidates: curr.positionMaxCandidates,
              positionTermLimit: curr.positionTermLimit,
              candidates: [],
            };
            acc.push(group);
          }
          group.candidates.push({
            candidateId: curr.candidateId,
            displayName: curr.displayName,
          });
          return acc;
        }, []);

        return grouped;
      },
    );
  }
}
