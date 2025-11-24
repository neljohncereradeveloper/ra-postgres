import { ApplicationAccess } from '@domain/models/application-access.model';

export interface ApplicationAccessRepository<Context = unknown> {
  createWithManager(
    applicationAccess: ApplicationAccess,
    context?: Context,
  ): Promise<ApplicationAccess>;
  updateWithManager(
    id: number,
    updateData: Partial<ApplicationAccess>,
    context?: Context,
  ): Promise<boolean>;
  softDeleteWithManager(id: number, context?: Context): Promise<boolean>;
  restoreWithManager(id: number, context?: Context): Promise<boolean>;
  findByIdWithManager(
    id: number,
    context?: Context,
  ): Promise<ApplicationAccess>;
  findWithFilters(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
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
  findById(id: number): Promise<ApplicationAccess>;
  findByDesc(desc1: string): Promise<ApplicationAccess>;
  findAll(): Promise<ApplicationAccess[]>;
}
