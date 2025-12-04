export interface BallotRepository<Context = unknown> {
  issueBallot(
    ballotNumber: string,
    delegateId: number,
    electionId: number,
    context: Context,
  ): Promise<any>;

  submitBallot(ballotNumber: string, context?: Context): Promise<any>;
  retrieveDelegateBallot(delegateId: number, context?: Context): Promise<any>;
  unlinkBallot(electionId: number, context?: Context): Promise<any>;
}
