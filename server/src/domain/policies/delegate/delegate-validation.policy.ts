// domain/policies/delegate/delegate-validation.policy.ts

import { Delegate } from '@domain/models/delegate.model';
import { DelegateBusinessException } from '@domains/exceptions/delegate/delegate-business.exception';
import { HTTP_STATUS } from '@shared/constants/http-status.constants';

/**
 * DelegateValidationPolicy
 *
 * This policy enforces business rules for delegate validation.
 */
export class DelegateValidationPolicy {
  /**
   * Validates delegate data
   *
   * This method enforces domain validation rules such as:
   * - Delegate must not be null
   * - Election ID must be provided and greater than zero
   * - Branch must be provided and meet length requirements (max 100 characters)
   * - Account ID must be provided and meet length requirements (max 100 characters)
   * - Account name must be provided and meet length requirements (max 255 characters)
   * - Control number must be provided
   * - Balance must be a valid number
   * - Loan status must be provided and meet length requirements (max 100 characters)
   * - MEV status must be provided and meet length requirements (max 100 characters)
   * - Age must be non-negative if provided
   *
   * @param delegate - The delegate to validate
   * @throws DelegateBusinessException - If delegate validation fails
   */
  validate(delegate: Delegate): void {
    if (!delegate) {
      throw new DelegateBusinessException(
        'Delegate not found',
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Validate if electionId is provided (foreign key reference to Election primary key)
    if (!delegate.electionId || delegate.electionId <= 0) {
      throw new DelegateBusinessException(
        'Election ID is required and must be a valid positive integer.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if branch is provided
    if (!delegate.branch || delegate.branch.trim().length === 0) {
      throw new DelegateBusinessException(
        'Branch is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if accountId is provided
    if (!delegate.accountId || delegate.accountId.trim().length === 0) {
      throw new DelegateBusinessException(
        'Account ID is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if accountName is provided
    if (!delegate.accountName || delegate.accountName.trim().length === 0) {
      throw new DelegateBusinessException(
        'Account name is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if accountName length is within limits (255 characters max based on entity)
    if (delegate.accountName.length > 255) {
      throw new DelegateBusinessException(
        'Account name must not exceed 255 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if controlNumber is provided
    if (!delegate.controlNumber || delegate.controlNumber.trim().length === 0) {
      throw new DelegateBusinessException(
        'Control number is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if balance is provided and is a valid number
    if (delegate.balance === undefined || delegate.balance === null) {
      throw new DelegateBusinessException(
        'Balance is required.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (typeof delegate.balance !== 'number' || isNaN(delegate.balance)) {
      throw new DelegateBusinessException(
        'Balance must be a valid number.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if loanStatus is provided
    if (!delegate.loanStatus || delegate.loanStatus.trim().length === 0) {
      throw new DelegateBusinessException(
        'Loan status is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if loanStatus length is within limits (100 characters max based on entity)
    if (delegate.loanStatus.length > 100) {
      throw new DelegateBusinessException(
        'Loan status must not exceed 100 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    // Validate if mevStatus is provided
    if (!delegate.mevStatus || delegate.mevStatus.trim().length === 0) {
      throw new DelegateBusinessException(
        'MEV status is required and cannot be empty.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (delegate.clientType && delegate.clientType.length > 100) {
      throw new DelegateBusinessException(
        'Client type must not exceed 100 characters.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }
}
