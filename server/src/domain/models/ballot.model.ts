export class Ballot {
  id: number;
  ballot_number: string;
  delegate_id: number;
  election_id: number;
  ballot_status: string;
  constructor(params: {
    id?: number;
    election_id: number;
    delegate_id: number;
    ballot_number: string;
    ballot_status: string;
  }) {
    this.id = params.id;
    this.election_id = params.election_id;
    this.delegate_id = params.delegate_id;
    this.ballot_number = params.ballot_number;
    this.ballot_status = params.ballot_status;
  }
}
