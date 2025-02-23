/**
 * @file databaseErrors.ts
 * @description Error classes for database errors.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date February 19, 2025
 */

/**
 * Error class for connection errors.
 */
export class ConnectionError extends Error {
  public originalError: Error;

  /**
   * Creates an instance of ConnectionError.
   * @param message - The error message.
   * @param originalError - The original error.
   */
  constructor(message: string, originalError: Error) {
    super(message);
    this.name = 'ConnectionError';
    this.originalError = originalError;
  }
}

/**
 * Error class for query errors.
 */
export class QueryError extends Error {
  public originalError: Error;

  /**
   * Creates an instance of QueryError.
   * @param message - The error message.
   * @param originalError - The original error.
   */
  constructor(message: string, originalError: Error) {
    super(message);
    this.name = 'QueryError';
    this.originalError = originalError;
  }
}
