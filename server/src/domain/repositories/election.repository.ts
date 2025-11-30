import { Election } from '@domain/models/election.model';

export interface ElectionRepository<Context = unknown> {
  create(election: Election, context?: Context): Promise<Election>;
  update(
    id: number,
    updateData: Partial<Election>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<Election>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    isArchived: boolean,
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
  findByName(name: string, context?: Context): Promise<Election | null>;
  combobox(): Promise<Election[]>;
  comboboxRetrieveScheduledElections(): Promise<Election[]>;
}
