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
  electionid: number;
  positionid: number;
  districtid: number;
  delegateid: number;
  displayname: string;
  deletedby?: string;
  deletedat?: Date | null;
  createdby?: string;
  createdat?: Date;
  updatedby?: string;
  updatedat?: Date;

  constructor(params: {
    id?: number;
    electionid: number;
    positionid: number;
    districtid: number;
    delegateid: number;
    displayname: string;
    deletedby?: string;
    deletedat?: Date | null;
    createdby?: string;
    createdat?: Date;
    updatedby?: string;
    updatedat?: Date;
  }) {
    this.id = params.id;
    this.electionid = params.electionid;
    this.positionid = params.positionid;
    this.districtid = params.districtid;
    this.delegateid = params.delegateid;
    this.displayname = params.displayname;
    this.deletedby = params.deletedby;
    this.deletedat = params.deletedat;
    this.createdby = params.createdby;
    this.createdat = params.createdat;
    this.updatedby = params.updatedby;
    this.updatedat = params.updatedat;
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
    electionid: number;
    positionid: number;
    districtid: number;
    delegateid: number;
    displayname: string;
    createdby?: string;
  }): Candidate {
    const candidate = new Candidate({
      electionid: params.electionid,
      positionid: params.positionid,
      districtid: params.districtid,
      delegateid: params.delegateid,
      displayname: params.displayname,
      createdby: params.createdby,
      createdat: getPHDateTime(),
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
    displayname: string;
    positionid: number;
    districtid: number;
    updatedby?: string;
  }): void {
    if (this.deletedat) {
      throw new CandidateBusinessException(
        'Candidate is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary candidate with the new values to validate before applying
    const tempCandidate = new Candidate({
      id: this.id,
      electionid: this.electionid,
      positionid: dto.positionid,
      districtid: dto.districtid,
      delegateid: this.delegateid,
      displayname: dto.displayname,
    });
    // Validate the new state before applying changes
    tempCandidate.validate();

    // Apply changes only if validation passes (data is already validated)
    this.displayname = dto.displayname;
    this.updatedby = dto.updatedby;
    this.updatedat = getPHDateTime();
  }

  /**
   * Archives (soft deletes) the candidate
   */
  archive(deletedby: string): void {
    // Validate if the candidate is not already archived
    if (this.deletedat) {
      throw new CandidateBusinessException(
        'Candidate is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deletedat = getPHDateTime();
    this.deletedby = deletedby;
  }

  /**
   * Restores a previously archived candidate
   */
  restore(): void {
    if (!this.deletedat) {
      throw new CandidateBusinessException(
        `Candidate with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the candidate
    this.deletedat = null;
    this.deletedby = null;
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
