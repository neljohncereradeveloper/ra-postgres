import { Election } from '@domain/models/election.model';

export interface ElectionRepository<Context = unknown> {
  create(election: Election, context?: Context): Promise<Election>;
  update(
    id: number,
    update_data: Partial<Election>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<Election>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<{
    data: Election[];
    meta: {
      page: number;
      limit: number;
      total_records: number;
      total_pages: number;
      next_page: number | null;
      previous_page: number | null;
    };
  }>;
  findByName(name: string, context?: Context): Promise<Election>;
  combobox(): Promise<Election[]>;
  comboboxRetrieveScheduledElections(): Promise<Election[]>;
}
