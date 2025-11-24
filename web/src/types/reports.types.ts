import { Election } from "@/lib/api/settings";

export interface CastVoteReport {
  data: {
    position: string;
    candidates: {
      name: string;
      voteCount: number;
    }[];
  }[];
  election: Election;
}

export interface CandidateReport {
  data: {
    position: string;
    candidates: {
      name: string;
    }[];
  }[];
  election: Election;
}
