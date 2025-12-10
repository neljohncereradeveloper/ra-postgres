export class CastVote {
  id: number;
  election_id: number;
  ballot_number: string;
  precinct: string;
  candidate_id: number;
  position_id: number;
  district_id: number;
  datetime_cast: Date;
  deleted_at?: Date | null;
  constructor(params: {
    id?: number;
    election_id: number;
    ballot_number: string;
    precinct: string;
    candidate_id: number;
    position_id: number;
    district_id: number;
    datetime_cast: Date;
    deleted_at?: Date | null;
  }) {
    this.id = params.id;
    this.election_id = params.election_id;
    this.ballot_number = params.ballot_number;
    this.precinct = params.precinct;
    this.candidate_id = params.candidate_id;
    this.position_id = params.position_id;
    this.district_id = params.district_id;
    this.datetime_cast = params.datetime_cast;
    this.deleted_at = params.deleted_at;
  }
}
