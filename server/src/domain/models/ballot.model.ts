export class Ballot {
  id: number;
  ballotnumber: string;
  delegateid: number;
  electionid: number;
  ballotstatus: string;
  constructor(params: {
    id?: number;
    electionid: number;
    delegateid: number;
    ballotnumber: string;
    ballotstatus: string;
  }) {
    this.id = params.id;
    this.electionid = params.electionid;
    this.delegateid = params.delegateid;
    this.ballotnumber = params.ballotnumber;
    this.ballotstatus = params.ballotstatus;
  }
}
