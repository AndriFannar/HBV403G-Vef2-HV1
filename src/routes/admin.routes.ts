/**
 * @file admin.routes.ts
 * @description Contains routes only accessible to administrators.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies
 */

import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { getEnvironment } from '../lib/config/environment.js';
import { getAllActors } from '../db/actor.db.js';
import { getAllUsers, getUserById } from '../db/users.db.js';
import { logger } from '../lib/io/logger.js';
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { jwt } from 'hono/jwt';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

export const adminApp = new Hono()

  /**
   * @description Get all users
   */
  .get(
    '/users',
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
   * @description Get all actors
   */
  .get(
    '/actors',
    jwt({ secret: environment.jwtSecret }),
    adminMiddleware,
    async c => {
      try {
        const actors = await getAllActors();
        return c.json(actors);
      } catch (e) {
        logger.error('Failed to get actors:', e);
        throw e;
      }
    }
  );
