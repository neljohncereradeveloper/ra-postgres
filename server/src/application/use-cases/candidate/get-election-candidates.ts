import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CandidateRepository } from '@domains/repositories/candidate.repository';
import { REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { ActiveElectionRepository } from '@domains/repositories/active-election.repository';
import { TransactionPort } from '@domain/ports/transaction-port';
import { CANDIDATE_ACTIONS } from '@domain/constants/candidate/candidate-actions.constants';
import { NotFoundException } from '@domains/exceptions/index';
import { ElectionRepository } from '@domains/repositories/election.repository';

@Injectable()
export class GetElectionCandidatesUseCase {
  constructor(
    @Inject(REPOSITORY_TOKENS.CANDIDATE)
    private readonly candidateRepository: CandidateRepository,
    @Inject(REPOSITORY_TOKENS.ACTIVE_ELECTION)
    private readonly activeElectionRepository: ActiveElectionRepository,
    @Inject(REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(REPOSITORY_TOKENS.ELECTION)
    private readonly electionRepository: ElectionRepository,
  ) {}

  async execute() {
    return this.transactionHelper.executeTransaction(
      CANDIDATE_ACTIONS.GET_ELECTION_CANDIDATES,
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

        // retrieve the candidates for the election
        const result = await this.candidateRepository.getElectionCandidates(
          election.id,
          manager,
        );

        console.log('result : ', result);

        // Group candidates by position
        const candidates = result.reduce((acc: any[], curr: any) => {
          // Find if this position already exists in acc
          let group = acc.find(
            (g) =>
              g.position === curr.position &&
              g.positionmaxcandidates === curr.positionmaxcandidates &&
              g.positiontermlimit === curr.positiontermlimit,
          );
          if (!group) {
            group = {
              position: curr.position,
              positionmaxcandidates: curr.positionmaxcandidates,
              positiontermlimit: curr.positiontermlimit,
              candidates: [],
            };
            acc.push(group);
          }
          group.candidates.push({
            candidateid: curr.candidateid,
            displayname: curr.displayname,
          });
          return acc;
        }, []);

        return candidates;
      },
    );
  }
}
