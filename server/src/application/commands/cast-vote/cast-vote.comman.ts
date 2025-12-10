export interface CandidateDto {
  id: number;
}

export interface CastVoteCommand {
  control_number: string;
  candidates: CandidateDto[];
}
