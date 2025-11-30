import { DomainException } from '../domain.exception';

/**
 * DistrictBusinessException
 *
 * Exception thrown when district business rule validation fails at the domain level.
 */
export class DistrictBusinessException extends DomainException {
  private static readonly ERROR_CODE = 'DISTRICT_BUSINESS_EXCEPTION';

  constructor(message: string, statusCode: number) {
    super(message, statusCode, DistrictBusinessException.ERROR_CODE);
  }
}
