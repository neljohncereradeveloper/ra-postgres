export class CastVote {
  id: number;
  electionId: number;
  ballotNumber: string;
  precinct: string;
  candidateId: number;
  positionId: number;
  districtId: number;
  dateTimeCast: Date;
  deletedAt?: Date | null;
  constructor(params: {
    id?: number;
    electionId: number;
    ballotNumber: string;
    precinct: string;
    candidateId: number;
    positionId: number;
    districtId: number;
    dateTimeCast: Date;
    deletedAt?: Date | null;
  }) {
    this.id = params.id;
    this.electionId = params.electionId;
    this.ballotNumber = params.ballotNumber;
    this.precinct = params.precinct;
    this.candidateId = params.candidateId;
    this.positionId = params.positionId;
    this.districtId = params.districtId;
    this.dateTimeCast = params.dateTimeCast;
    this.deletedAt = params.deletedAt;
  }
}
