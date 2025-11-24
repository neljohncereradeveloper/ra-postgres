export class Ballot {
  id: number;
  ballotNumber: string;
  delegateId: number;
  electionId: number;
  status: string;
  constructor(params: {
    id?: number;
    electionId: number;
    delegateId: number;
    ballotNumber: string;
    status: string;
  }) {
    this.id = params.id;
    this.electionId = params.electionId;
    this.delegateId = params.delegateId;
    this.ballotNumber = params.ballotNumber;
    this.status = params.status;
  }
}
