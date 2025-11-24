import { Position } from '@domain/models/position.model';

export interface PositionRepository<Context = unknown> {
  create(position: Position, context?: Context): Promise<Position>;
  update(
    id: number,
    updateData: Partial<Position>,
    context?: Context,
  ): Promise<boolean>;
  softDelete(id: number, context?: Context): Promise<boolean>;
  restoreDeleted(id: number, context?: Context): Promise<boolean>;
  findById(id: number, context?: Context): Promise<Position>;
  findPaginatedListWithElectionId(
    term: string,
    page: number,
    limit: number,
    isDeleted: boolean,
    electionId: number,
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
  findByDescriptionWithElectionId(
    desc1: string,
    electionId: number,
    context: Context,
  ): Promise<Position | null>;
  findAllWithElectionId(
    electionId: number,
    context: Context,
  ): Promise<Position[]>;
  findByElectionId(electionId: number, context: Context): Promise<Position[]>;
  countByElectionId(electionId: number, context?: Context): Promise<number>;
}
