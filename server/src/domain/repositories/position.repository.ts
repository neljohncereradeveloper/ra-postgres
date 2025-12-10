import { Position } from '@domain/models/position.model';
import { PaginatedResult } from '@domain/interfaces/pagination.interface';

export interface PositionRepository<Context = unknown> {
  create(position: Position, context?: Context): Promise<Position>;
  update(
    id: number,
    dto: Partial<Position>,
    context?: Context,
  ): Promise<boolean>;
  findById(id: number, context: Context): Promise<Position>;
  findPaginatedList(
    term: string,
    page: number,
    limit: number,
    election_id: number,
    is_archived: boolean,
    context: Context,
  ): Promise<PaginatedResult<Position>>;
  findByDescription(
    desc1: string,
    election_id: number,
    context: Context,
  ): Promise<Position | null>;
  combobox(election_id: number, context: Context): Promise<Position[]>;
  findByElection(election_id: number, context: Context): Promise<Position[]>;
  countByElection(election_id: number, context?: Context): Promise<number>;
}
