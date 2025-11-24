import { Election } from "@/lib/api/settings";

export interface CastVote {
  ballotId: string;
  precinct: string;
  election: Election;
}

export interface CastVoteCandidates {
  position: string;
  positionMaxCandidates: number;
  positionTermLimit: string;
  candidates: Candidate[];
}

export interface Candidate {
  candidateId: number;
  displayName: string;
}

export interface BallotProps {
  selections: { [position: string]: number[] };
  candidates: CastVoteCandidates[];
  castVote: CastVote;
  onExit?: () => void;
}
