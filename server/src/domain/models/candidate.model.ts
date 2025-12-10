import { CandidateValidationPolicy } from '@domain/policies/candidate/candidate-validation.policy';
import { CandidateBusinessException } from '@domains/exceptions/candidate/candidate-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';
import { getPHDateTime } from '@domain/utils/format-ph-time';

/**
 * Candidate Domain Model
 *
 * Represents a candidate within an election.
 * This is a rich domain model that encapsulates business logic and behavior.
 */
export class Candidate {
  id: number;
  election_id: number;
  position_id: number;
  district_id: number;
  delegate_id: number;
  display_name: string;
  deleted_by?: string;
  deleted_at?: Date | null;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;

  constructor(params: {
    id?: number;
    election_id: number;
    position_id: number;
    district_id: number;
    delegate_id: number;
    display_name: string;
    deleted_by?: string;
    deleted_at?: Date | null;
    created_by?: string;
    created_at?: Date;
    updated_by?: string;
    updated_at?: Date;
  }) {
    this.id = params.id;
    this.election_id = params.election_id;
    this.position_id = params.position_id;
    this.district_id = params.district_id;
    this.delegate_id = params.delegate_id;
    this.display_name = params.display_name;
    this.deleted_by = params.deleted_by;
    this.deleted_at = params.deleted_at;
    this.created_by = params.created_by;
    this.created_at = params.created_at;
    this.updated_by = params.updated_by;
    this.updated_at = params.updated_at;
  }

  /**
   * Creates a new candidate instance with validation
   *
   * This static factory method creates a new candidate and validates it
   * to ensure it meets all business rules before being persisted.
   *
   * Why static? Because we're creating a NEW instance - there's no existing
   * instance to call the method on. Static methods can be called on the class
   * itself: Candidate.create({...})
   *
   * @param params - Candidate creation parameters
   * @returns A new validated Candidate instance
   * @throws CandidateBusinessException - If validation fails
   */
  static create(params: {
    election_id: number;
    position_id: number;
    district_id: number;
    delegate_id: number;
    display_name: string;
    created_by?: string;
  }): Candidate {
    const candidate = new Candidate({
      election_id: params.election_id,
      position_id: params.position_id,
      district_id: params.district_id,
      delegate_id: params.delegate_id,
      display_name: params.display_name,
      created_by: params.created_by,
      created_at: getPHDateTime(),
    });
    // Validate the candidate before returning
    candidate.validate();
    return candidate;
  }

  /**
   * Updates the candidate details
   *
   * This method encapsulates the logic for updating candidate properties.
   * It validates the new state before applying changes to ensure the candidate
   * remains in a valid state. If validation fails, no changes are applied.
   *
   * @param dto - Candidate data containing fields to update (displayName is required)
   * @param updatedBy - Username of the user performing the update (required for audit)
   * @throws CandidateBusinessException - If validation fails
   */
  update(dto: {
    display_name: string;
    position_id: number;
    district_id: number;
    updated_by?: string;
  }): void {
    if (this.deleted_at) {
      throw new CandidateBusinessException(
        'Candidate is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary candidate with the new values to validate before applying
    const tempCandidate = new Candidate({
      id: this.id,
      election_id: this.election_id,
      position_id: dto.position_id,
      district_id: dto.district_id,
      delegate_id: this.delegate_id,
      display_name: dto.display_name,
    });
    // Validate the new state before applying changes
    tempCandidate.validate();

    // Apply changes only if validation passes (data is already validated)
    this.display_name = dto.display_name;
    this.updated_by = dto.updated_by;
    this.updated_at = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the candidate
   */
  archive(deleted_by: string): void {
    // Validate if the candidate is not already archived
    if (this.deleted_at) {
      throw new CandidateBusinessException(
        'Candidate is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deleted_at = getPHDateTime();
    this.deleted_by = deleted_by;
  }

  /**
   * Restores a previously archived candidate
   */
  restore(): void {
    if (!this.deleted_at) {
      throw new CandidateBusinessException(
        `Candidate with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the candidate
    this.deleted_at = null;
    this.deleted_by = null;
  }

  /**
   * Validates the candidate against business rules
   *
   * This method enforces domain validation rules such as:
   * - Election ID must be valid
   * - Position ID must be valid
   * - District ID must be valid
   * - Delegate ID must be valid
   * - Display name must meet length requirements
   * - All required fields must be present
   *
   * @throws CandidateBusinessException - If validation fails
   */
  validate(): void {
    new CandidateValidationPolicy().validate(this);
  }
}
