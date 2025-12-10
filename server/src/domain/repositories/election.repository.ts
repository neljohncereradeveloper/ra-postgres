import { Election } from '@domain/models/election.model';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

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
  ): Promise<PaginatedResult<Election>>;
  findByName(name: string, context?: Context): Promise<Election>;
  combobox(): Promise<Election[]>;
  comboboxRetrieveScheduledElections(): Promise<Election[]>;
}
