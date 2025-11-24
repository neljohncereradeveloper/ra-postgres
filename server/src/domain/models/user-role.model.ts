export class UserRole {
  id: number;
  desc1: string;
  deletedAt?: Date | null;
  constructor(params: { id?: number; desc1: string; deletedAt?: Date | null }) {
    this.id = params.id;
    this.desc1 = params.desc1;
    this.deletedAt = params.deletedAt;
  }
}
