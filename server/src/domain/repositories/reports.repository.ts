export interface ReportsRepository<Context = unknown> {
  electionCastVoteReport(election_id: number, context?: Context): Promise<any>;
  electionCandidatesReport(
    election_id: number,
    context?: Context,
  ): Promise<any>;
}
