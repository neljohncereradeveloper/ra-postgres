import { Precinct } from '@domain/models/precinct.model';

export interface PrecinctRepository<Context = unknown> {
  create(precinct: Precinct, context?: Context): Promise<Precinct>;
  update(
    id: number,
    updateData: Partial<Precinct>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, context?: Context): Promise<boolean>;
  restoreDeleted(id: number, context?: Context): Promise<boolean>;
  findById(id: number, context?: Context): Promise<Precinct>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
    context?: Context,
  ): Promise<{
    data: Precinct[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(desc1: string, context?: Context): Promise<Precinct | null>;
  findAll(context?: Context): Promise<Precinct[]>;
}
