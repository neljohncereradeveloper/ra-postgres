// domain/exceptions/event-cancellation.exception.ts

import { NotFoundException } from '../shared/not-found.exception';

/**
 * ElectionNotFoundException
 *
 * Exception thrown when an election cannot be found.
 */
export class ElectionNotFoundException extends NotFoundException {
  constructor(
    message: string = 'No active election found. Set active election first.',
  ) {
    super(message);
  }
}
