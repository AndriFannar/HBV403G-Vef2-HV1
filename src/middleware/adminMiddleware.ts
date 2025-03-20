import { getEnvironment } from '../lib/config/environment.js';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/io/logger.js';
import type { Context, Next } from 'hono';

const env = getEnvironment(process.env, logger);

if (!env) {
  process.exit(1);
}

export const adminMiddleware = async (c: Context, next: Next) => {
  const payload = await c.get('jwtPayload');
  if (payload && payload.role === 'ADMIN') {
    await next();
  } else {
    return c.json({ message: 'Unauthorized' }, StatusCodes.UNAUTHORIZED);
  }
};
