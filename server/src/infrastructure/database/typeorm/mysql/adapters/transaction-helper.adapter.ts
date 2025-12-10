import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TransactionPort } from '@domain/ports/transaction-port';
import {
  DataSource,
  EntityManager,
  QueryRunner,
  QueryFailedError,
} from 'typeorm';

@Injectable()
export class TransactionAdapter implements TransactionPort {
  constructor(private readonly dataSource: DataSource) {}

  async executeTransaction<T>(
    action_log: string,
    operation: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const logger = new Logger(action_log);
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    let isTransactionActive = false;

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      isTransactionActive = true;
      logger.debug('Starting new transaction.');

      const result = await operation(queryRunner.manager);
      await queryRunner.commitTransaction();
      isTransactionActive = false;
      logger.debug('Transaction committed successfully.');
      return result;
    } catch (error) {
      // Rollback transaction if it's still active
      if (isTransactionActive && queryRunner.isTransactionActive) {
        try {
          await queryRunner.rollbackTransaction();
          logger.debug('Transaction rolled back successfully.');
        } catch (rollbackError) {
          logger.error(
            'Failed to rollback transaction.',
            rollbackError instanceof Error
              ? rollbackError.stack
              : rollbackError,
          );
          // Log but don't throw - we want to throw the original error
        }
      }

      // Enhanced error logging
      logger.error(
        `Transaction failed for action: ${action_log}`,
        error instanceof Error ? error.stack : String(error),
      );

      // Handle PostgreSQL-specific errors
      if (error instanceof QueryFailedError) {
        const errorMessage = error.message;
        const errorCode = (error as any).code; // PostgreSQL error codes

        logger.error('Database query failed.', {
          message: errorMessage,
          code: errorCode,
          query: (error as any).query,
        });

        // PostgreSQL-specific error handling
        if (errorCode) {
          // Handle common PostgreSQL error codes
          switch (errorCode) {
            case '23505': // Unique violation
              throw new InternalServerErrorException(
                'A duplicate record already exists.',
              );
            case '23503': // Foreign key violation
              throw new InternalServerErrorException(
                'Referenced record does not exist.',
              );
            case '23502': // Not null violation
              throw new InternalServerErrorException(
                'Required field is missing.',
              );
            case '23514': // Check constraint violation
              throw new InternalServerErrorException('Data validation failed.');
            case '40001': // Serialization failure (deadlock)
              throw new InternalServerErrorException(
                'Transaction conflict. Please retry.',
              );
            default:
              throw new InternalServerErrorException(
                'A database error occurred.',
              );
          }
        } else {
          throw new InternalServerErrorException('A database error occurred.');
        }
      }

      // Re-throw the original error for other error types
      throw error;
    } finally {
      // Always release the query runner, even if rollback failed
      try {
        if (queryRunner.isReleased === false) {
          await queryRunner.release();
          logger.debug('Transaction resources released.');
        }
      } catch (releaseError) {
        logger.error(
          'Failed to release query runner.',
          releaseError instanceof Error
            ? releaseError.stack
            : String(releaseError),
        );
        // Don't throw - this is cleanup
      }
    }
  }
}
