import { Candidate } from '@domain/models/candidate.model';

export interface CandidateRepository<Context = unknown> {
  create(candidate: Candidate, context?: Context): Promise<Candidate>;
  update(
    id: number,
    dto: Partial<Candidate>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<Candidate>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
    electionId: number,
    context?: Context,
  ): Promise<{
    data: Candidate[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  countByElection(electionId: number, context?: Context): Promise<number>;
  getElectionCandidates(electionId: number, context?: Context): Promise<any[]>;
}
