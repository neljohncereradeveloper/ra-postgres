export class Position {
  id: number;
  electionId: number;
  desc1: string;
  maxCandidates: number;
  termLimit: string;
  deletedAt?: Date | null;
  constructor(params: {
    id?: number;
    electionId: number;
    desc1: string;
    maxCandidates: number;
    termLimit: string;
    deletedAt?: Date | null;
  }) {
    this.id = params.id;
    this.electionId = params.electionId;
    this.desc1 = params.desc1;
    this.maxCandidates = params.maxCandidates;
    this.termLimit = params.termLimit;
    this.deletedAt = params.deletedAt;
  }
}
