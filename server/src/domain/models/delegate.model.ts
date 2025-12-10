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
  electionid: number;
  branch: string;
  accountid: string;
  accountname: string;
  age?: number;
  birthdate?: Date;
  address?: string;
  tell?: string;
  cell?: string;
  dateopened?: Date;
  clienttype?: string;
  balance: number;
  loanstatus: string;
  mevstatus: string;
  hasvoted?: boolean;
  controlnumber: string;
  deletedby?: string;
  deletedat?: Date | null;
  createdby?: string;
  createdat?: Date;
  updatedby?: string;
  updatedat?: Date;

  constructor(params: {
    id?: number;
    branch: string;
    electionid: number;
    accountid: string;
    accountname: string;
    age?: number;
    balance: number;
    loanstatus: string;
    mevstatus: string;
    controlnumber: string;
    clienttype?: string;
    address?: string;
    tell?: string;
    cell?: string;
    dateopened?: Date;
    birthdate?: Date;
    hasvoted?: boolean;
    deletedat?: Date | null;
    deletedby?: string;
    createdby?: string;
    createdat?: Date;
    updatedby?: string;
    updatedat?: Date;
  }) {
    this.id = params.id;
    this.branch = params.branch;
    this.electionid = params.electionid;
    this.accountid = params.accountid;
    this.accountname = params.accountname;
    this.age = params.age;
    this.clienttype = params.clienttype;
    this.balance = params.balance;
    this.loanstatus = params.loanstatus;
    this.mevstatus = params.mevstatus;
    this.address = params.address;
    this.tell = params.tell;
    this.cell = params.cell;
    this.dateopened = params.dateopened;
    this.birthdate = params.birthdate;
    this.hasvoted = params.hasvoted;
    this.controlnumber = params.controlnumber;
    this.deletedat = params.deletedat;
    this.deletedby = params.deletedby;
    this.createdby = params.createdby;
    this.createdat = params.createdat;
    this.updatedby = params.updatedby;
    this.updatedat = params.updatedat;
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
    electionid: number;
    branch: string;
    accountid: string;
    accountname: string;
    balance: number;
    loanstatus: string;
    mevstatus: string;
    controlnumber: string;
    age?: number;
    birthdate?: Date;
    address?: string;
    tell?: string;
    cell?: string;
    dateopened?: Date;
    clienttype?: string;
    hasvoted?: boolean;
    createdby?: string;
  }): Delegate {
    const delegate = new Delegate({
      electionid: params.electionid,
      branch: params.branch,
      accountid: params.accountid,
      accountname: params.accountname,
      balance: params.balance,
      loanstatus: params.loanstatus,
      mevstatus: params.mevstatus,
      controlnumber: params.controlnumber,
      age: params.age,
      birthdate: params.birthdate,
      address: params.address,
      tell: params.tell,
      cell: params.cell,
      dateopened: params.dateopened,
      clienttype: params.clienttype,
      hasvoted: params.hasvoted,
      createdby: params.createdby,
      createdat: getPHDateTime(),
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
    accountid?: string;
    accountname?: string;
    age?: number;
    birthdate?: Date;
    address?: string;
    tell?: string;
    cell?: string;
    dateopened?: Date;
    clienttype?: string;
    balance?: number;
    loanstatus?: string;
    mevstatus?: string;
    controlnumber?: string;
    hasvoted?: boolean;
    updatedby?: string;
  }): void {
    if (this.deletedat) {
      throw new DelegateBusinessException(
        'Delegate is archived and cannot be updated',
        HTTP_STATUS.CONFLICT,
      );
    }

    // Create a temporary delegate with the new values to validate before applying
    const tempDelegate = new Delegate({
      id: this.id,
      electionid: this.electionid,
      branch: dto.branch ?? this.branch,
      accountid: dto.accountid ?? this.accountid,
      accountname: dto.accountname ?? this.accountname,
      balance: dto.balance ?? this.balance,
      loanstatus: dto.loanstatus ?? this.loanstatus,
      mevstatus: dto.mevstatus ?? this.mevstatus,
      controlnumber: dto.controlnumber ?? this.controlnumber,
      age: dto.age ?? this.age,
      birthdate: dto.birthdate ?? this.birthdate,
      address: dto.address ?? this.address,
      tell: dto.tell ?? this.tell,
      cell: dto.cell ?? this.cell,
      dateopened: dto.dateopened ?? this.dateopened,
      clienttype: dto.clienttype ?? this.clienttype,
      hasvoted: dto.hasvoted ?? this.hasvoted,
      updatedby: dto.updatedby,
      updatedat: getPHDateTime(),
    });
    // Validate the new state before applying changes
    tempDelegate.validate();

    // Apply changes only if validation passes (data is already validated)
    if (dto.branch !== undefined) this.branch = dto.branch;
    if (dto.accountid !== undefined) this.accountid = dto.accountid;
    if (dto.accountname !== undefined) this.accountname = dto.accountname;
    if (dto.age !== undefined) this.age = dto.age;
    if (dto.birthdate !== undefined) this.birthdate = dto.birthdate;
    if (dto.address !== undefined) this.address = dto.address;
    if (dto.tell !== undefined) this.tell = dto.tell;
    if (dto.cell !== undefined) this.cell = dto.cell;
    if (dto.dateopened !== undefined) this.dateopened = dto.dateopened;
    if (dto.clienttype !== undefined) this.clienttype = dto.clienttype;
    if (dto.balance !== undefined) this.balance = dto.balance;
    if (dto.loanstatus !== undefined) this.loanstatus = dto.loanstatus;
    if (dto.mevstatus !== undefined) this.mevstatus = dto.mevstatus;
    if (dto.controlnumber !== undefined) this.controlnumber = dto.controlnumber;
    if (dto.hasvoted !== undefined) this.hasvoted = dto.hasvoted;
  }

  /**
   * Archives (soft deletes) the delegate
   */
  archive(deletedby: string): void {
    // Validate if the delegate is not already archived
    if (this.deletedat) {
      throw new DelegateBusinessException(
        'Delegate is already archived.',
        HTTP_STATUS.CONFLICT, // Conflict - resource already in the desired state
      );
    }

    this.deletedat = getPHDateTime();
    this.deletedby = deletedby;
  }

  /**
   * Restores a previously archived delegate
   */
  restore(): void {
    if (!this.deletedat) {
      throw new DelegateBusinessException(
        `Delegate with ID ${this.id} is not archived.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // restore the delegate
    this.deletedat = null;
    this.deletedby = null;
  }

  /**
   * Validates the delegate against business rules
   *
   * This method enforces domain validation rules such as:
   * - Electionid must be valid
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
