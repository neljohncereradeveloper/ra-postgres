// domain/exceptions/election-update-not-allowed.exception.ts

import { DomainException } from '../domain.exception';

/**
 * ElectionUpdateNotAllowedException
 *
 * This exception is thrown when an update is attempted on an election that is not allowed to be updated.
 */
export class ElectionUpdateNotAllowedException extends DomainException {
  constructor(
    message: string = 'Election updates are not allowed due to the election state.',
  ) {
    super(message, 'ELECTION_UPDATE_NOT_ALLOWED');
  }
}
