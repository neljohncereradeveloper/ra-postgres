export class CastVote {
  id: number;
  electionid: number;
  ballotnumber: string;
  precinct: string;
  candidateid: number;
  positionid: number;
  districtid: number;
  datetimecast: Date;
  deletedat?: Date | null;
  constructor(params: {
    id?: number;
    electionid: number;
    ballotnumber: string;
    precinct: string;
    candidateid: number;
    positionid: number;
    districtid: number;
    datetimecast: Date;
    deletedat?: Date | null;
  }) {
    this.id = params.id;
    this.electionid = params.electionid;
    this.ballotnumber = params.ballotnumber;
    this.precinct = params.precinct;
    this.candidateid = params.candidateid;
    this.positionid = params.positionid;
    this.districtid = params.districtid;
    this.datetimecast = params.datetimecast;
    this.deletedat = params.deletedat;
  }
}
