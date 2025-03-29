/**
 * @file utilMiddleware.ts
 * @description Contains utility middleware functions for the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 28, 2025
 * @dependencies hono, http-status-codes
 */

import type { Context, Next } from 'hono';
import { StatusCodes } from 'http-status-codes';

/**
 * Parses the ID from the request parameters and sets it in the context.
 * @param c - The Hono context object.
 * @param next - The next middleware function.
 * @returns - A promise that resolves to the next middleware function.
 */
export const parseId = async (c: Context, next: Next) => {
  const idStr = c.req.param('id');
  const id = parseInt(idStr, 10);

  if (isNaN(id)) {
    return c.json({ message: 'Invalid ID' }, StatusCodes.BAD_REQUEST);
  }

  c.set('id', id);
  return next();
};
