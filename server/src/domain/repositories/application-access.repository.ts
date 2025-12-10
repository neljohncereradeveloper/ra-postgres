import { ApplicationAccess } from '@domain/models/application-access.model';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

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
  ): Promise<PaginatedResult<ApplicationAccess>>;
  findByDesc(desc1: string): Promise<ApplicationAccess>;
  combobox(): Promise<ApplicationAccess[]>;
}
