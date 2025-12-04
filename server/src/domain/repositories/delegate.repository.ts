import { Delegate } from '@domain/models/delegate.model';

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
    isArchived: boolean,
    electionId: number,
    context?: Context,
  ): Promise<{
    data: Delegate[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  // findAllWithElectionId(
  //   electionId: number,
  //   context?: Context,
  // ): Promise<Delegate[]>;
  findByControlNumberAndElectionId(
    controlNumber: string,
    electionId: number,
    context?: Context,
  ): Promise<Delegate>;
  // findByAccountIdWithElectionId(
  //   accountId: string,
  //   electionId: number,
  //   context?: Context,
  // ): Promise<Delegate>;
  countByElection(electionId: number, context?: Context): Promise<number>;
  markAsVoted(delegateId: number, context?: Context): Promise<void>;
}
//
