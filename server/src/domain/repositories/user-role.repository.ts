import { UserRole } from '@domain/models/user-role.model';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

export interface UserRoleRepository<Context = unknown> {
  create(userRole: UserRole, context?: Context): Promise<UserRole>;
  update(
    id: number,
    update_data: Partial<UserRole>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<UserRole>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<PaginatedResult<UserRole>>;
  findByDesc(desc1: string): Promise<UserRole>;
  combobox(): Promise<UserRole[]>;
}
