import { DelegateValidationPolicy } from '@domain/policies/delegate/delegate-validation.policy';
import { DelegateBusinessException } from '@domains/exceptions/delegate/delegate-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * Delegate Domain Model
 *
 * Represents a delegate within an election.
 * This is a rich domain model that encapsulates business logic and behavior.
 */
export class Delegate {
  id: number;
  electionId: number;
  branch: string;
  accountId: string;
  accountName: string;
  age?: number;
  birthDate?: Date;
  address?: string;
  tell?: string;
  cell?: string;
  dateOpened?: Date;
  clientType?: string;
  balance: number;
  loanStatus: string;
  mevStatus: string;
  hasVoted?: boolean;
  controlNumber: string;
  deletedBy?: string;
  deletedAt?: Date | null;
  createdBy?: string;
  createdAt?: Date;
  updatedBy?: string;
  updatedAt?: Date;

  constructor(params: {
    id?: number;
    branch: string;
    electionId: number;
    accountId: string;
    accountName: string;
    age?: number;
    balance: number;
    loanStatus: string;
    mevStatus: string;
    controlNumber: string;
    clientType?: string;
    address?: string;
    tell?: string;
    cell?: string;
    dateOpened?: Date;
    birthDate?: Date;
    hasVoted?: boolean;
    deletedAt?: Date | null;
    deletedBy?: string;
    createdBy?: string;
    createdAt?: Date;
    updatedBy?: string;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.branch = params.branch;
    this.electionId = params.electionId;
    this.accountId = params.accountId;
    this.accountName = params.accountName;
    this.age = params.age;
    this.clientType = params.clientType;
    this.balance = params.balance;
    this.loanStatus = params.loanStatus;
    this.mevStatus = params.mevStatus;
    this.address = params.address;
    this.tell = params.tell;
    this.cell = params.cell;
    this.dateOpened = params.dateOpened;
    this.birthDate = params.birthDate;
    this.hasVoted = params.hasVoted;
    this.controlNumber = params.controlNumber;
    this.deletedAt = params.deletedAt;
    this.deletedBy = params.deletedBy;
    this.createdBy = params.createdBy;
    this.createdAt = params.createdAt;
    this.updatedBy = params.updatedBy;
    this.updatedAt = params.updatedAt;
  }

  /**
   * Creates a new delegate instance with validation
   *
   * This static factory method creates a new delegate and validates it
   * to ensure it meets all business rules before being persisted.
   *
   * Why static? Because we're creating a NEW instance - there's no existing
   * instance to call the method on. Static methods can be called on the class
   * itself: Delegate.create({...})
   *
   * @param params - Delegate creation parameters
   * @returns A new validated Delegate instance
   * @throws DelegateBusinessException - If validation fails
   */
  static create(params: {
    electionId: number;
    branch: string;
    accountId: string;
    accountName: string;
    balance: number;
    loanStatus: string;
    mevStatus: string;
    controlNumber: string;
    age?: number;
    birthDate?: Date;
    address?: string;
    tell?: string;
    cell?: string;
    dateOpened?: Date;
    clientType?: string;
    hasVoted?: boolean;
    createdBy?: string;
  }): Delegate {
    const delegate = new Delegate({
      electionId: params.electionId,
      branch: params.branch,
      accountId: params.accountId,
      accountName: params.accountName,
      balance: params.balance,
      loanStatus: params.loanStatus,
      mevStatus: params.mevStatus,
      controlNumber: params.controlNumber,
      age: params.age,
      birthDate: params.birthDate,
      address: params.address,
      tell: params.tell,
      cell: params.cell,
      dateOpened: params.dateOpened,
      clientType: params.clientType,
      hasVoted: params.hasVoted,
      createdBy: params.createdBy,
      createdAt: new Date(),
    });
    // Validate the delegate before returning
    delegate.validate();
    return delegate;
  }

  /**
   * Updates the delegate details
   *
   * This method encapsulates the logic for updating delegate properties.
   * It validates the new state before applying changes to ensure the delegate
   * remains in a valid state. If validation fails, no changes are applied.
   *
   * @param dto - Delegate data containing fields to update
   * @throws DelegateBusinessException - If validation fails or delegate is archived
   */
  update(dto: {
    branch?: string;
    accountId?: string;
    accountName?: string;
    age?: number;
    birthDate?: Date;
    address?: string;
    tell?: string;
    cell?: string;
    dateOpened?: Date;
    clientType?: string;
    balance?: number;
    loanStatus?: string;
    mevStatus?: string;
    controlNumber?: string;
    hasVoted?: boolean;
    updatedBy?: string;
  }): void {
    if (this.deletedAt) {
      throw new DelegateBusinessException(
        'Delegate is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary delegate with the new values to validate before applying
    const tempDelegate = new Delegate({
      id: this.id,
      electionId: this.electionId,
      branch: dto.branch ?? this.branch,
      accountId: dto.accountId ?? this.accountId,
      accountName: dto.accountName ?? this.accountName,
      balance: dto.balance ?? this.balance,
      loanStatus: dto.loanStatus ?? this.loanStatus,
      mevStatus: dto.mevStatus ?? this.mevStatus,
      controlNumber: dto.controlNumber ?? this.controlNumber,
      age: dto.age ?? this.age,
      birthDate: dto.birthDate ?? this.birthDate,
      address: dto.address ?? this.address,
      tell: dto.tell ?? this.tell,
      cell: dto.cell ?? this.cell,
      dateOpened: dto.dateOpened ?? this.dateOpened,
      clientType: dto.clientType ?? this.clientType,
      hasVoted: dto.hasVoted ?? this.hasVoted,
      updatedBy: dto.updatedBy,
    });
    // Validate the new state before applying changes
    tempDelegate.validate();

    // Apply changes only if validation passes (data is already validated)
    if (dto.branch !== undefined) this.branch = dto.branch;
    if (dto.accountId !== undefined) this.accountId = dto.accountId;
    if (dto.accountName !== undefined) this.accountName = dto.accountName;
    if (dto.age !== undefined) this.age = dto.age;
    if (dto.birthDate !== undefined) this.birthDate = dto.birthDate;
    if (dto.address !== undefined) this.address = dto.address;
    if (dto.tell !== undefined) this.tell = dto.tell;
    if (dto.cell !== undefined) this.cell = dto.cell;
    if (dto.dateOpened !== undefined) this.dateOpened = dto.dateOpened;
    if (dto.clientType !== undefined) this.clientType = dto.clientType;
    if (dto.balance !== undefined) this.balance = dto.balance;
    if (dto.loanStatus !== undefined) this.loanStatus = dto.loanStatus;
    if (dto.mevStatus !== undefined) this.mevStatus = dto.mevStatus;
    if (dto.controlNumber !== undefined) this.controlNumber = dto.controlNumber;
    if (dto.hasVoted !== undefined) this.hasVoted = dto.hasVoted;
  }

  /**
   * Archives (soft deletes) the delegate
   */
  archive(deletedBy: string): void {
    // Validate if the delegate is not already archived
    if (this.deletedAt) {
      throw new DelegateBusinessException(
        'Delegate is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
  }

  /**
   * Restores a previously archived delegate
   */
  restore(): void {
    if (!this.deletedAt) {
      throw new DelegateBusinessException(
        `Delegate with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the delegate
    this.deletedAt = null;
    this.deletedBy = null;
  }

  /**
   * Validates the delegate against business rules
   *
   * This method enforces domain validation rules such as:
   * - Election ID must be valid
   * - Branch, account ID, account name must meet length requirements
   * - Control number must be provided
   * - Balance must be a valid number
   * - Loan status and MEV status must meet length requirements
   * - All required fields must be present
   *
   * @throws DelegateBusinessException - If validation fails
   */
  validate(): void {
    new DelegateValidationPolicy().validate(this);
  }
}
