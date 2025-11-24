export class Setting {
  id: number;
  setupCode?: string;
  electionId?: number;
  constructor(params: {
    id?: number;
    setupCode?: string;
    electionId?: number;
  }) {
    this.id = params.id;
    this.setupCode = params.setupCode;
    this.electionId = params.electionId;
  }
}
