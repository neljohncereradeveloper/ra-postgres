import { DelegateValidationPolicy } from '@domain/policies/delegate/delegate-validation.policy';
import { getPHDateTime } from '@domain/utils/format-ph-time';
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
  election_id: number;
  branch: string;
  account_id: string;
  account_name: string;
  age?: number;
  birth_date?: Date;
  address?: string;
  tell?: string;
  cell?: string;
  date_opened?: Date;
  client_type?: string;
  balance: number;
  loan_status: string;
  mev_status: string;
  has_voted?: boolean;
  control_number: string;
  deleted_by?: string;
  deleted_at?: Date | null;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;

  constructor(params: {
    id?: number;
    branch: string;
    election_id: number;
    account_id: string;
    account_name: string;
    age?: number;
    balance: number;
    loan_status: string;
    mev_status: string;
    control_number: string;
    client_type?: string;
    address?: string;
    tell?: string;
    cell?: string;
    date_opened?: Date;
    birth_date?: Date;
    has_voted?: boolean;
    deleted_at?: Date | null;
    deleted_by?: string;
    created_by?: string;
    created_at?: Date;
    updated_by?: string;
    updated_at?: Date;
  }) {
    this.id = params.id;
    this.branch = params.branch;
    this.election_id = params.election_id;
    this.account_id = params.account_id;
    this.account_name = params.account_name;
    this.age = params.age;
    this.client_type = params.client_type;
    this.balance = params.balance;
    this.loan_status = params.loan_status;
    this.mev_status = params.mev_status;
    this.address = params.address;
    this.tell = params.tell;
    this.cell = params.cell;
    this.date_opened = params.date_opened;
    this.birth_date = params.birth_date;
    this.has_voted = params.has_voted;
    this.control_number = params.control_number;
    this.deleted_at = params.deleted_at;
    this.deleted_by = params.deleted_by;
    this.created_by = params.created_by;
    this.created_at = params.created_at;
    this.updated_by = params.updated_by;
    this.updated_at = params.updated_at;
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
    election_id: number;
    branch: string;
    account_id: string;
    account_name: string;
    balance: number;
    loan_status: string;
    mev_status: string;
    control_number: string;
    age?: number;
    birth_date?: Date;
    address?: string;
    tell?: string;
    cell?: string;
    date_opened?: Date;
    client_type?: string;
    has_voted?: boolean;
    created_by?: string;
  }): Delegate {
    const delegate = new Delegate({
      election_id: params.election_id,
      branch: params.branch,
      account_id: params.account_id,
      account_name: params.account_name,
      balance: params.balance,
      loan_status: params.loan_status,
      mev_status: params.mev_status,
      control_number: params.control_number,
      age: params.age,
      birth_date: params.birth_date,
      address: params.address,
      tell: params.tell,
      cell: params.cell,
      date_opened: params.date_opened,
      client_type: params.client_type,
      has_voted: params.has_voted,
      created_by: params.created_by,
      created_at: getPHDateTime(),
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
    account_id?: string;
    account_name?: string;
    age?: number;
    birth_date?: Date;
    address?: string;
    tell?: string;
    cell?: string;
    date_opened?: Date;
    client_type?: string;
    balance?: number;
    loan_status?: string;
    mev_status?: string;
    control_number?: string;
    has_voted?: boolean;
    updated_by?: string;
  }): void {
    if (this.deleted_at) {
      throw new DelegateBusinessException(
        'Delegate is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary delegate with the new values to validate before applying
    const tempDelegate = new Delegate({
      id: this.id,
      election_id: this.election_id,
      branch: dto.branch ?? this.branch,
      account_id: dto.account_id ?? this.account_id,
      account_name: dto.account_name ?? this.account_name,
      balance: dto.balance ?? this.balance,
      loan_status: dto.loan_status ?? this.loan_status,
      mev_status: dto.mev_status ?? this.mev_status,
      control_number: dto.control_number ?? this.control_number,
      age: dto.age ?? this.age,
      birth_date: dto.birth_date ?? this.birth_date,
      address: dto.address ?? this.address,
      tell: dto.tell ?? this.tell,
      cell: dto.cell ?? this.cell,
      date_opened: dto.date_opened ?? this.date_opened,
      client_type: dto.client_type ?? this.client_type,
      has_voted: dto.has_voted ?? this.has_voted,
      updated_by: dto.updated_by,
      updated_at: getPHDateTime(),
    });
    // Validate the new state before applying changes
    tempDelegate.validate();

    // Apply changes only if validation passes (data is already validated)
    if (dto.branch !== undefined) this.branch = dto.branch;
    if (dto.account_id !== undefined) this.account_id = dto.account_id;
    if (dto.account_name !== undefined) this.account_name = dto.account_name;
    if (dto.age !== undefined) this.age = dto.age;
    if (dto.birth_date !== undefined) this.birth_date = dto.birth_date;
    if (dto.address !== undefined) this.address = dto.address;
    if (dto.tell !== undefined) this.tell = dto.tell;
    if (dto.cell !== undefined) this.cell = dto.cell;
    if (dto.date_opened !== undefined) this.date_opened = dto.date_opened;
    if (dto.client_type !== undefined) this.client_type = dto.client_type;
    if (dto.balance !== undefined) this.balance = dto.balance;
    if (dto.loan_status !== undefined) this.loan_status = dto.loan_status;
    if (dto.mev_status !== undefined) this.mev_status = dto.mev_status;
    if (dto.control_number !== undefined)
      this.control_number = dto.control_number;
    if (dto.has_voted !== undefined) this.has_voted = dto.has_voted;
  }

  /**
   * Archives (soft deletes) the delegate
   */
  archive(deleted_by: string): void {
    // Validate if the delegate is not already archived
    if (this.deleted_at) {
      throw new DelegateBusinessException(
        'Delegate is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deleted_at = getPHDateTime();
    this.deleted_by = deleted_by;
  }

  /**
   * Restores a previously archived delegate
   */
  restore(): void {
    if (!this.deleted_at) {
      throw new DelegateBusinessException(
        `Delegate with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the delegate
    this.deleted_at = null;
    this.deleted_by = null;
  }

  /**
   * Validates the delegate against business rules
   *
   * This method enforces domain validation rules such as:
   * - Election_id must be valid
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
