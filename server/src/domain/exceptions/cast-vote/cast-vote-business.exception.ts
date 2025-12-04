import { DomainException } from '../domain.exception';

/**
 * CastVoteBusinessException
 *
 * Exception thrown when cast vote business rule validation fails at the domain level.
 */
export class CastVoteBusinessException extends DomainException {
  private static readonly ERROR_CODE = 'CAST_VOTE_BUSINESS_EXCEPTION';

  constructor(message: string, statusCode: number) {
    super(message, statusCode, CastVoteBusinessException.ERROR_CODE);
  }
}
