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
  electionId?: number;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;

  constructor(params: {
    id?: number;
    electionId?: number;
    createdBy?: string;
    createdAt?: Date;
    updatedBy?: string;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.electionId = params.electionId;
    this.createdBy = params.createdBy;
    this.createdAt = params.createdAt;
    this.updatedBy = params.updatedBy;
    this.updatedAt = params.updatedAt;
  }

  /**
   * Sets the active election
   *
   * This method encapsulates the logic for setting which election is currently active.
   * It updates the electionId and audit fields.
   *
   * @param electionId - The ID of the election to set as active
   * @param updatedBy - Username of the user performing the update (required for audit)
   * @throws Error - If electionId is invalid (not provided or <= 0)
   */
  setActiveElection(electionId: number, updatedBy: string): void {
    if (!electionId || electionId <= 0) {
      throw new Error(
        'Election ID is required and must be a valid positive integer.',
      );
    }

    this.electionId = electionId;
    this.updatedBy = updatedBy;
    this.updatedAt = getPHDateTime();
  }

  /**
   * Resets (clears) the active election
   *
   * This method clears the active election by setting electionId to null.
   * This is useful when closing or resetting the system state.
   *
   * @param updatedBy - Username of the user performing the reset (required for audit)
   */
  reset(updatedBy: string): void {
    this.electionId = null;
    this.updatedBy = updatedBy;
    this.updatedAt = getPHDateTime();
  }

  /**
   * Checks if an election is currently active
   *
   * @returns true if an election is set as active, false otherwise
   */
  hasActiveElection(): boolean {
    return this.electionId !== null && this.electionId !== undefined;
  }
}
