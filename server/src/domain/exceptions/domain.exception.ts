// domain/exceptions/domain.exception.ts

export class DomainException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}
