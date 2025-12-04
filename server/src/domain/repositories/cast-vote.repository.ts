import { CastVote } from '@domain/models/cast-vote.model';

export interface CastVoteRepository<Context = unknown> {
  castVote(castVote: CastVote, context?: Context): Promise<CastVote>;
  reprintCastVote(
    electionId: number,
    ballotNumber: string,
    context?: Context,
  ): Promise<CastVote>;
}
