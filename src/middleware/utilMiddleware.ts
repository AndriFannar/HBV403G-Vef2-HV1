/**
 * @file utilMiddleware.ts
 * @description Contains utility middleware functions for the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.1.0
 * @date March 28, 2025
 * @dependencies hono, http-status-codes
 */

import type { Context, Next } from 'hono';
import { StatusCodes } from 'http-status-codes';

/**
 * Parses a parameter from the request and sets it in the context.
 * If the parameter is not a valid number, it returns a 400 Bad Request response.
 * @param c - The Hono context object.
 * @param next - The next middleware function.
 * @returns - A promise that resolves to the next middleware function.
 */
export const parseParamId =
  (paramName: string) => async (c: Context, next: Next) => {
    const idStr = c.req.param(paramName);
    const id = parseInt(idStr, 10);

    if (isNaN(id)) {
      return c.json(
        { message: `Invalid ${paramName}` },
        StatusCodes.BAD_REQUEST
      );
    }

    c.set(paramName, id);
    return next();
  };
