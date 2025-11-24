export class District {
  id: number;
  electionId: number;
  desc1: string;
  deletedAt?: Date | null;
  constructor(params: {
    id?: number;
    electionId: number;
    desc1: string;
    deletedAt?: Date | null;
  }) {
    this.id = params.id;
    this.electionId = params.electionId;
    this.desc1 = params.desc1;
    this.deletedAt = params.deletedAt;
  }
}
