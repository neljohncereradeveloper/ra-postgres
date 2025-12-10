import { User } from '@domain/models/user.model';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

export interface UserRepository<Context = unknown> {
  create(user: User, context?: Context): Promise<User>;
  update(
    id: number,
    update_data: Partial<User>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<User>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
  ): Promise<PaginatedResult<User>>;
  findByUserName(user_name: string): Promise<User>;
}
