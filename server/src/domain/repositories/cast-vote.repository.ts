import { CastVote } from '@domain/models/cast-vote.model';

export interface CastVoteRepository<Context = unknown> {
  castVote(cast_vote: CastVote, context?: Context): Promise<CastVote>;
  reprintCastVote(
    election_id: number,
    ballot_number: string,
    context?: Context,
  ): Promise<CastVote>;
}
