/**
 * ActiveElection Domain Model
 *
 * Represents the currently active election in the system.
 * This is a singleton pattern - only one active election can exist at a time.
 */
export class ActiveElection {
  id: number;
  setupCode?: string;
  electionId?: number;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;

  constructor(params: {
    id?: number;
    setupCode?: string;
    electionId?: number;
    createdBy?: string;
    createdAt?: Date;
    updatedBy?: string;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.setupCode = params.setupCode;
    this.electionId = params.electionId;
    this.createdBy = params.createdBy;
    this.createdAt = params.createdAt;
    this.updatedBy = params.updatedBy;
    this.updatedAt = params.updatedAt;
  }
}
