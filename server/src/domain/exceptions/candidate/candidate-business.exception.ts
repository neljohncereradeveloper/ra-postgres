import { DomainException } from '../domain.exception';

/**
 * CandidateBusinessException
 *
 * Exception thrown when candidate business rule validation fails at the domain level.
 */
export class CandidateBusinessException extends DomainException {
  private static readonly ERROR_CODE = 'CANDIDATE_BUSINESS_EXCEPTION';

  constructor(message: string, statusCode: number) {
    super(message, statusCode, CandidateBusinessException.ERROR_CODE);
  }
}

