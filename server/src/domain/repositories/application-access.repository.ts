import { ApplicationAccess } from '@domain/models/application-access.model';

export interface ApplicationAccessRepository<Context = unknown> {
  create(
    application_access: ApplicationAccess,
    context?: Context,
  ): Promise<ApplicationAccess>;
  update(
    id: number,
    update_data: Partial<ApplicationAccess>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<ApplicationAccess>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<{
    data: ApplicationAccess[];
    meta: {
      page: number;
      limit: number;
      total_records: number;
      total_pages: number;
      next_page: number | null;
      previous_page: number | null;
    };
  }>;
  findByDesc(desc1: string): Promise<ApplicationAccess>;
  combobox(): Promise<ApplicationAccess[]>;
}
