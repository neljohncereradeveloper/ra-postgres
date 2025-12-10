import { Precinct } from '@domain/models/precinct.model';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

export interface PrecinctRepository<Context = unknown> {
  create(precinct: Precinct, context?: Context): Promise<Precinct>;
  update(
    id: number,
    dto: Partial<Precinct>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<Precinct | null>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<PaginatedResult<Precinct>>;
  findByDescription(desc1: string, context?: Context): Promise<Precinct | null>;
  combobox(): Promise<Precinct[]>;
}
