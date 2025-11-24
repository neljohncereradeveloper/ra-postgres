import { Election } from '@domain/models/election.model';

export interface ElectionRepository<Context = unknown> {
  create(election: Election, context?: Context): Promise<Election>;
  update(
    id: number,
    updateData: Partial<Election>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, context?: Context): Promise<boolean>;
  restoreDeleted(id: number, context?: Context): Promise<boolean>;
  findById(id: number, context?: Context): Promise<Election>;
  findByIdNoneTransaction(id: number): Promise<any>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
  ): Promise<{
    data: Election[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findAll(): Promise<Election[]>;
  findByName(name: string, context?: Context): Promise<Election | null>;
  retrieveScheduledElections(): Promise<Election[]>;
}
