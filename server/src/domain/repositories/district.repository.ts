import { District } from '@domain/models/district.model';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

export interface DistrictRepository<Context = unknown> {
  create(district: District, context?: Context): Promise<District>;
  update(
    id: number,
    update_data: Partial<District>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context?: Context): Promise<District>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    is_archived: boolean,
    election_id: number,
    context?: Context,
  ): Promise<PaginatedResult<District>>;
  findByDescription(
    desc1: string,
    election_id: number,
    context?: Context,
  ): Promise<District | null>;
  combobox(election_id: number, context?: Context): Promise<District[]>;
  countByElection(election_id: number, context?: Context): Promise<number>;
}
