export interface BallotRepository<Context = unknown> {
  issueBallot(
    ballot_number: string,
    delegate_id: number,
    election_id: number,
    context: Context,
  ): Promise<any>;

  submitBallot(ballot_number: string, context?: Context): Promise<any>;
  retrieveDelegateBallot(delegate_id: number, context?: Context): Promise<any>;
  unlinkBallot(election_id: number, context?: Context): Promise<any>;
}
