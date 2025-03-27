/**
 * @file users.routes.ts
 * @description Contains the routes for the user endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies hono, logger.ts, userValidator.ts, users.db.ts, http-status-codes
 */

import { validateAndSanitizeBaseUser } from '../lib/validation/userValidator.js';
import { createUser, getAllUsers, getUserByUsername } from '../db/users.db.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { getEnvironment } from '../lib/config/environment.js';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/io/logger.js';
import { sign, jwt } from 'hono/jwt';
import { Hono } from 'hono';
import bcrypt from 'bcrypt';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

const saltRounds = 10;

export const userApp = new Hono()
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
   * @description Get all users
   */
  .get(
    '/',
    jwt({ secret: environment.jwtSecret }),
    adminMiddleware,
    async c => {
      try {
        const users = await getAllUsers();
        return c.json(users);
      } catch (e) {
        logger.error('Failed to get users:', e);
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
