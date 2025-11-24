import { Candidate } from '@domain/models/candidate.model';

export interface CandidateRepository<Context = unknown> {
  create(candidate: Candidate, context?: Context): Promise<Candidate>;
  update(
    id: number,
    updateData: Partial<Candidate>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, context?: Context): Promise<boolean>;
  restoreDeleted(id: number, context?: Context): Promise<boolean>;
  findById(id: number, context?: Context): Promise<Candidate>;
  findPaginatedListWithElectionId(
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
  countByElectionId(electionId: number, context?: Context): Promise<number>;
  getCastVoteCandidates(electionId: number, context?: Context): Promise<any[]>;
}
