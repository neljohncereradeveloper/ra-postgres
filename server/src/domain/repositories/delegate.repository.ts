import { Delegate } from '@domain/models/delegate.model';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

export interface DelegateRepository<Context = unknown> {
  create(delegate: Delegate, context?: Context): Promise<Delegate>;
  update(
    id: number,
    dto: Partial<Delegate>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<Delegate>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    election_id: number,
    context?: Context,
  ): Promise<PaginatedResult<Delegate>>;
  // findAllWithElectionId(
  //   electionId: number,
  //   context?: Context,
  // ): Promise<Delegate[]>;
  findByControlNumberAndElectionId(
    control_number: string,
    election_id: number,
    context?: Context,
  ): Promise<Delegate>;
  // findByAccountIdWithElectionId(
  //   accountId: string,
  //   electionId: number,
  //   context?: Context,
  // ): Promise<Delegate>;
  countByElection(election_id: number, context?: Context): Promise<number>;
  markAsVoted(delegate_id: number, context?: Context): Promise<void>;
}
//
