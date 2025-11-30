import { Position } from '@domain/models/position.model';

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
    electionId: number,
    isArchived: boolean,
    context: Context,
  ): Promise<{
    data: Position[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }>;
  findByDescription(
    desc1: string,
    electionId: number,
    context: Context,
  ): Promise<Position | null>;
  combobox(electionId: number, context: Context): Promise<Position[]>;
  findByElection(electionId: number, context: Context): Promise<Position[]>;
  countByElection(electionId: number, context?: Context): Promise<number>;
}
