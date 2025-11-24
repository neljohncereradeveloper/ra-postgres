import { Election } from "@/lib/api/settings";

export interface CastVoteReprint {
  ballotId: string;
  precinct: string;
  election: Election;
  groupCandidates: Candidate[];
}

export interface Candidate {
  position: string;
  candidates: {
    id: number;
    name: string;
  }[];
}
