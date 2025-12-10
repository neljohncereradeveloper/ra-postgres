import { getPHDateTime } from '@domain/utils/format-ph-time';

/**
 * ActiveElection Domain Model
 *
 * Represents the currently active election in the system.
 * This is a singleton pattern - only one active election can exist at a time.
 * The record is identified by id = 1.
 * This is a rich domain model that encapsulates business logic and behavior.
 */
export class ActiveElection {
  id: number;
  electionid?: number;
  createdby?: string;
  createdat?: Date;
  updatedby?: string;
  updatedat?: Date;

  constructor(params: {
    id?: number;
    electionid?: number;
    createdby?: string;
    createdat?: Date;
    updatedby?: string;
    updatedat?: Date;
  }) {
    this.id = params.id;
    this.electionid = params.electionid;
    this.createdby = params.createdby;
    this.createdat = params.createdat;
    this.updatedby = params.updatedby;
    this.updatedat = params.updatedat;
  }

  /**
   * Sets the active election
   *
   * This method encapsulates the logic for setting which election is currently active.
   * It updates the electionid and audit fields.
   *
   * @param electionid - The ID of the election to set as active
   * @param updatedby - Username of the user performing the update (required for audit)
   * @throws Error - If electionid is invalid (not provided or <= 0)
   */
  setActiveElection(electionid: number, updatedby: string): void {
    if (!electionid || electionid <= 0) {
      throw new Error(
        'Election id is required and must be a valid positive integer.',
      );
    }

    this.electionid = electionid;
    this.updatedby = updatedby;
    this.updatedat = getPHDateTime();
  }

  /**
   * Resets (clears) the active election
   *
   * This method clears the active election by setting electionid to null.
   * This is useful when closing or resetting the system state.
   *
   * @param updatedby - Username of the user performing the reset (required for audit)
   */
  reset(updatedby: string): void {
    this.electionid = null;
    this.updatedby = updatedby;
    this.updatedat = getPHDateTime();
  }

  /**
   * Checks if an election is currently active
   *
   * @returns true if an election is set as active, false otherwise
   */
  hasActiveElection(): boolean {
    return this.electionid !== null && this.electionid !== undefined;
  }
}
