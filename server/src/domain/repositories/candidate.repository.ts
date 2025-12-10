import { Candidate } from '@domain/models/candidate.model';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

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
    is_deleted: boolean,
    election_id: number,
    context?: Context,
  ): Promise<PaginatedResult<Candidate>>;
  countByElection(election_id: number, context?: Context): Promise<number>;
  getElectionCandidates(election_id: number, context?: Context): Promise<any[]>;
}
