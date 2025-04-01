/**
 * @file users.routes.ts
 * @description Contains the routes for the user endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies hono, logger.ts, userValidator.ts, users.db.ts, http-status-codes, bcrypt, hono/jwt
 */

import { validateAndSanitizeBaseUser } from '../lib/validation/userValidator.js';
import { createUser, getUserByUsername } from '../db/users.db.js';
import { getUseCasesSummaryByUserId } from '../db/useCases.db.js';
import { getEnvironment } from '../lib/config/environment.js';
import type { Variables } from '../entities/context.js';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/io/logger.js';
import { jwt, sign } from 'hono/jwt';
import { Hono } from 'hono';
import bcrypt from 'bcrypt';
import {
  parseParamId,
  processLimitOffset,
} from '../middleware/utilMiddleware.js';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

const saltRounds = 10;

export const userApp = new Hono<{ Variables: Variables }>()
  /**
   * @description Get a user by username
   */
  .post('/login', async c => {
    try {
      let loginData: unknown;
      try {
        loginData = await c.req.json();
      } catch {
        return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
      }

      const validLoginData = await validateAndSanitizeBaseUser(loginData);

      if (!validLoginData.data) {
        return c.json(
          { message: 'Invalid data', errors: validLoginData.error },
          StatusCodes.BAD_REQUEST
        );
      }

      const user = await getUserByUsername(validLoginData.data.username);

      if (
        !user ||
        !(await bcrypt.compare(validLoginData.data.password, user.password))
      ) {
        return c.json(
          { message: 'Invalid Credentials' },
          StatusCodes.UNAUTHORIZED
        );
      }

      const payload = {
        sub: user.id,
        role: user.role,
      };

      const token = await sign(payload, environment?.jwtSecret);

      return c.json({ token });
    } catch (e) {
      logger.error('Failed to get user:', e);
      throw e;
    }
  })

  /**
   * @description Create a new user
   */
  .post('/signup', async c => {
    try {
      let newUser: unknown;
      try {
        newUser = await c.req.json();
      } catch {
        return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
      }

      const validUser = await validateAndSanitizeBaseUser(newUser);

      if (!validUser.data) {
        return c.json(
          { message: 'Invalid data', errors: validUser.error },
          StatusCodes.BAD_REQUEST
        );
      }

      if (await getUserByUsername(validUser.data.username)) {
        return c.json({ message: 'User already exists' }, StatusCodes.CONFLICT);
      }

      validUser.data.password = await bcrypt.hash(
        validUser.data.password,
        saltRounds
      );
      const createdUser = await createUser(validUser.data);
      return c.json(createdUser, StatusCodes.CREATED);
    } catch (e) {
      logger.error('Failed to create user:', e);
      throw e;
    }
  })

  /**
   * @description Get summary of use cases by user ID
   */
  .get(
    '/:userId/useCases/summary',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    processLimitOffset,
    async c => {
      try {
        const userId = c.get('userId');
        const limit = c.get('limit');
        const offset = c.get('offset');

        const useCases = await getUseCasesSummaryByUserId(
          userId,
          limit,
          offset
        );

        if (!useCases) {
          return c.json(
            { message: 'No Use Cases found' },
            StatusCodes.NOT_FOUND
          );
        }

        return c.json({
          data: useCases,
          pagination: {
            limit: limit || 'default',
            offset: offset || 'default',
          },
        });
      } catch (e) {
        logger.error('Failed to get Use Cases:', e);
        throw e;
      }
    }
  )

  /**
   * @description Error handling for internal server errors
   */
  .onError((err, c) => {
    logger.error('Internal Server Error:', err);
    return c.json(
      { message: 'Internal Server Error' },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  });
