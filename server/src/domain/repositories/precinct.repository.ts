import { Precinct } from '@domain/models/precinct.model';

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
  ): Promise<{
    data: Precinct[];
    meta: {
      page: number;
      limit: number;
      total_records: number;
      total_pages: number;
      next_page: number | null;
      previous_page: number | null;
    };
  }>;
  findByDescription(desc1: string, context?: Context): Promise<Precinct | null>;
  combobox(): Promise<Precinct[]>;
}
