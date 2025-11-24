export interface CandidateDto {
  id: number;
}

export interface CastVoteCommand {
  controlNumber: string;
  candidates: CandidateDto[];
}
