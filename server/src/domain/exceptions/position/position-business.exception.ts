import { DomainException } from '../domain.exception';

/**
 * PositionBusinessException
 *
 * Exception thrown when position business rule validation fails at the domain level.
 */
export class PositionBusinessException extends DomainException {
  private static readonly ERROR_CODE = 'POSITION_BUSINESS_EXCEPTION';

  constructor(message: string, statusCode: number) {
    super(message, statusCode, PositionBusinessException.ERROR_CODE);
  }
}
