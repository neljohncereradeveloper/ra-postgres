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
  election_id?: number;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;

  constructor(params: {
    id?: number;
    election_id?: number;
    created_by?: string;
    created_at?: Date;
    updated_by?: string;
    updated_at?: Date;
  }) {
    this.id = params.id;
    this.election_id = params.election_id;
    this.created_by = params.created_by;
    this.created_at = params.created_at;
    this.updated_by = params.updated_by;
    this.updated_at = params.updated_at;
  }

  /**
   * Sets the active election
   *
   * This method encapsulates the logic for setting which election is currently active.
   * It updates the election_id and updated_by fields.
   *
   * @param election_id - The ID of the election to set as active
   * @param updated_by - Username of the user performing the update (required for audit)
   * @throws Error - If election_id is invalid (not provided or <= 0)
   */
  setActiveElection(election_id: number, updated_by: string): void {
    if (!election_id || election_id <= 0) {
      throw new Error(
        'Election id is required and must be a valid positive integer.',
      );
    }

    this.election_id = election_id;
    this.updated_by = updated_by;
    this.updated_at = getPHDateTime();
  }

  /**
   * Resets (clears) the active election
   *
   * This method clears the active election by setting election_id to null.
   * This is useful when closing or resetting the system state.
   *
   * @param updated_by - Username of the user performing the reset (required for audit)
   */
  reset(updated_by: string): void {
    this.election_id = null;
    this.updated_by = updated_by;
    this.updated_at = getPHDateTime();
  }

  /**
   * Checks if an election is currently active
   *
   * @returns true if an election is set as active, false otherwise
   */
  hasActiveElection(): boolean {
    return this.election_id !== null && this.election_id !== undefined;
  }
}
