/**
 * @file adminMiddleware.ts
 * @description Middleware that checks if the user is an admin before allowing access to a route.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies http-status-codes, hono, logger.js, environment.js
 */

import { getEnvironment } from '../lib/config/environment.js';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/io/logger.js';
import type { Context, Next } from 'hono';
import { jwt } from 'hono/jwt';

const env = getEnvironment(process.env, logger);

if (!env) {
  process.exit(1);
}

export const jwtMiddleware = async (c: Context, next: Next) => {
  try {
    await jwt({ secret: env.jwtSecret })(c, next);
  } catch (error) {
    return c.json(
      { message: error instanceof Error ? error.message : 'Unauthorized' },
      StatusCodes.UNAUTHORIZED
    );
  }
};

/**
 * @description Middleware that checks if the user is an admin before allowing access to a route.
 * @param c - Hono context
 * @param next - Next middleware
 * @returns - Returns a 401 Unauthorized response if the user is not an admin, otherwise calls the next middleware.
 */
export const adminMiddleware = async (c: Context, next: Next) => {
  const payload = await c.get('jwtPayload');
  if (payload && payload.role === 'ADMIN') {
    await next();
  } else {
    return c.json({ message: 'Unauthorized' }, StatusCodes.UNAUTHORIZED);
  }
};
