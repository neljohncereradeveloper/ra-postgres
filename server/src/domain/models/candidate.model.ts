import { CandidateValidationPolicy } from '@domain/policies/candidate/candidate-validation.policy';
import { CandidateBusinessException } from '@domains/exceptions/candidate/candidate-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * Candidate Domain Model
 *
 * Represents a candidate within an election.
 * This is a rich domain model that encapsulates business logic and behavior.
 */
export class Candidate {
  id: number;
  electionId: number;
  positionId: number;
  districtId: number;
  delegateId: number;
  displayName: string;
  deletedBy?: string;
  deletedAt?: Date | null;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;

  constructor(params: {
    id?: number;
    electionId: number;
    positionId: number;
    districtId: number;
    delegateId: number;
    displayName: string;
    deletedBy?: string;
    deletedAt?: Date | null;
    createdBy?: string;
    createdAt?: Date;
    updatedBy?: string;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.electionId = params.electionId;
    this.positionId = params.positionId;
    this.districtId = params.districtId;
    this.delegateId = params.delegateId;
    this.displayName = params.displayName;
    this.deletedBy = params.deletedBy;
    this.deletedAt = params.deletedAt;
    this.createdBy = params.createdBy;
    this.createdAt = params.createdAt;
    this.updatedBy = params.updatedBy;
    this.updatedAt = params.updatedAt;
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
    electionId: number;
    positionId: number;
    districtId: number;
    delegateId: number;
    displayName: string;
    createdBy?: string;
  }): Candidate {
    const candidate = new Candidate({
      electionId: params.electionId,
      positionId: params.positionId,
      districtId: params.districtId,
      delegateId: params.delegateId,
      displayName: params.displayName,
      createdBy: params.createdBy,
      createdAt: new Date(),
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
    displayName: string;
    positionId: number;
    districtId: number;

    updatedBy?: string;
  }): void {
    if (this.deletedAt) {
      throw new CandidateBusinessException(
        'Candidate is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary candidate with the new values to validate before applying
    const tempCandidate = new Candidate({
      id: this.id,
      electionId: this.electionId,
      positionId: dto.positionId,
      districtId: dto.districtId,
      delegateId: this.delegateId,
      displayName: dto.displayName,
    });
    // Validate the new state before applying changes
    tempCandidate.validate();

    // Apply changes only if validation passes (data is already validated)
    this.displayName = dto.displayName;
    this.updatedBy = dto.updatedBy;
    this.updatedAt = new Date();
  }

  /**
   * Archives (soft deletes) the candidate
   */
  archive(deletedBy: string): void {
    // Validate if the candidate is not already archived
    if (this.deletedAt) {
      throw new CandidateBusinessException(
        'Candidate is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
  }

  /**
   * Restores a previously archived candidate
   */
  restore(): void {
    if (!this.deletedAt) {
      throw new CandidateBusinessException(
        `Candidate with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the candidate
    this.deletedAt = null;
    this.deletedBy = null;
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
