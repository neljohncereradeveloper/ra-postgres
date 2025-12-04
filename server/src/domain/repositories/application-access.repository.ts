import { ApplicationAccess } from '@domain/models/application-access.model';

export interface ApplicationAccessRepository<Context = unknown> {
  create(
    applicationAccess: ApplicationAccess,
    context?: Context,
  ): Promise<ApplicationAccess>;
  update(
    id: number,
    updateData: Partial<ApplicationAccess>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<ApplicationAccess>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    isArchived: boolean,
  ): Promise<{
    data: ApplicationAccess[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDesc(desc1: string): Promise<ApplicationAccess>;
  combobox(): Promise<ApplicationAccess[]>;
}
