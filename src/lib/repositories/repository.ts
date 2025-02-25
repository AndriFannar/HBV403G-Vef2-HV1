/**
 * @file repository.ts
 * @description Repository class for database interactions.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date February 18, 2025
 * @dependencies pg, dotenv, errors/databaseErrors
 */

import { ConnectionError, QueryError } from '../errors/databaseErrors.js';
import { logger } from '../io/logger.js';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

/**
 * Repository class for database interactions.
 */
export class Repository {
  private pool: pg.Pool;

  /**
   * Creates a new Repository instance.
   * @param connectionString - The connection string to the database.
   */
  constructor(connectionString?: string) {
    const dbUrl = connectionString || process.env.DATABASE_URL;
    if (!dbUrl) {
      logger.error('DATABASE_URL not provided in .env');
      process.exit(1);
    }

    const poolConfig: pg.PoolConfig = {
      connectionString: dbUrl,
      // Disable SSL for CI env.
      ssl: process.env.CI ? false : { rejectUnauthorized: false },
    };
    this.pool = new pg.Pool(poolConfig);

    this.pool.on('error', err => {
      logger.error('Unexpected Postgres error:', err);
      process.exit(1);
    });
  }

  /**
   * Executes a single query against the database.
   * @param query - The query to execute.
   * @param values - The values to pass to the query.
   * @returns - The result of the query.
   */
  async queryDatabase<T extends pg.QueryResultRow = pg.QueryResultRow>(
    query: string,
    values: unknown[] = []
  ): Promise<T[]> {
    let client: pg.PoolClient;

    try {
      client = await this.pool.connect();
    } catch (err) {
      logger.error('Unable to connect: ', err);
      throw new ConnectionError(
        'Unable to connect to database',
        err instanceof Error ? err : new Error(String(err))
      );
    }

    try {
      const result = await client.query<T>(query, values);
      return result.rows;
    } catch (err) {
      logger.error('Query failed: ', err);
      throw new QueryError(
        'Database Query Failed',
        err instanceof Error ? err : new Error(String(err))
      );
    } finally {
      client.release();
    }
  }

  /**
   * Executes a transaction against the database.
   * @param callback - The callback to execute within the transaction.
   * @returns - The result of the transaction.
   */
  async transaction<T>(
    // eslint-disable-next-line no-unused-vars
    callback: (client: pg.PoolClient) => Promise<T>
  ): Promise<T> {
    let client: pg.PoolClient;

    try {
      client = await this.pool.connect();
    } catch (err) {
      logger.error('Unable to connect: ', err);
      throw new ConnectionError(
        'Unable to connect to database',
        err instanceof Error ? err : new Error(String(err))
      );
    }

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Transaction failed: ', err);
      throw new QueryError(
        'Database Transaction Failed',
        err instanceof Error ? err : new Error(String(err))
      );
    } finally {
      client.release();
    }
  }
}
