export interface ReportsRepository<Context = unknown> {
  electionCastVoteReport(electionId: number, context?: Context): Promise<any>;
  electionCandidatesReport(electionId: number, context?: Context): Promise<any>;
}
