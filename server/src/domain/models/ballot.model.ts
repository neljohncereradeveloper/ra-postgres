export class Ballot {
  id: number;
  ballotNumber: string;
  delegateId: number;
  electionId: number;
  ballotStatus: string;
  constructor(params: {
    id?: number;
    electionId: number;
    delegateId: number;
    ballotNumber: string;
    ballotStatus: string;
  }) {
    this.id = params.id;
    this.electionId = params.electionId;
    this.delegateId = params.delegateId;
    this.ballotNumber = params.ballotNumber;
    this.ballotStatus = params.ballotStatus;
  }
}
