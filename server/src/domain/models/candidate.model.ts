export class Candidate {
  id: number;
  electionId: number;
  positionId: number;
  districtId: number;
  delegateId: number;
  displayName: string;
  deletedAt?: Date | null;

  constructor(params: {
    id?: number;
    electionId: number;
    positionId: number;
    districtId: number;
    delegateId: number;
    displayName: string;
    deletedAt?: Date | null;
  }) {
    this.id = params.id;
    this.electionId = params.electionId;
    this.positionId = params.positionId;
    this.districtId = params.districtId;
    this.delegateId = params.delegateId;
    this.displayName = params.displayName;
    this.deletedAt = params.deletedAt;
  }
}
