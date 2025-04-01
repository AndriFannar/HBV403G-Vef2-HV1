/**
 * @file admin.routes.ts
 * @description Contains routes only accessible to administrators.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies adminMiddleware, config/environment, db/businessRules.db, db/projects.db, db/actor.db, db/users.db, lib/io/logger, hono/jwt, hono
 */

import { processLimitOffset } from '../middleware/utilMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { getAllBusinessRules } from '../db/businessRules.db.js';
import { getEnvironment } from '../lib/config/environment.js';
import type { Variables } from '../entities/context.js';
import { getAllProjects } from '../db/projects.db.js';
import { getAllUseCases } from '../db/useCases.db.js';
import { getAllActors } from '../db/actor.db.js';
import { getAllUsers } from '../db/users.db.js';
import { logger } from '../lib/io/logger.js';
import { jwt } from 'hono/jwt';
import { Hono } from 'hono';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

export const adminApp = new Hono<{ Variables: Variables }>()

  /**
   * @description Get all users
   */
  .get(
    '/users',
    jwt({ secret: environment.jwtSecret }),
    adminMiddleware,
    processLimitOffset,
    async c => {
      try {
        const limit = c.get('limit');
        const offset = c.get('offset');
        const users = await getAllUsers(limit, offset);
        return c.json({
          data: users,
          pagination: {
            limit: limit || 'default',
            offset: offset || 'default',
          },
        });
      } catch (e) {
        logger.error('Failed to get Users:', e);
        throw e;
      }
    }
  )

  /**
   * @description Get all projects
   */
  .get(
    '/projects',
    jwt({ secret: environment.jwtSecret }),
    adminMiddleware,
    processLimitOffset,
    async c => {
      try {
        const limit = c.get('limit');
        const offset = c.get('offset');
        const projects = await getAllProjects(limit, offset);
        return c.json({
          data: projects,
          pagination: {
            limit: limit || 'default',
            offset: offset || 'default',
          },
        });
      } catch (e) {
        logger.error('Failed to get Projects:', e);
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
    processLimitOffset,
    async c => {
      try {
        const limit = c.get('limit');
        const offset = c.get('offset');
        const actors = await getAllActors(limit, offset);
        return c.json({
          data: actors,
          pagination: {
            limit: limit || 'default',
            offset: offset || 'default',
          },
        });
      } catch (e) {
        logger.error('Failed to get Actors:', e);
        throw e;
      }
    }
  )

  /**
   * @description Get all business rules
   */
  .get(
    '/businessRules',
    jwt({ secret: environment.jwtSecret }),
    adminMiddleware,
    processLimitOffset,
    async c => {
      try {
        const limit = c.get('limit');
        const offset = c.get('offset');
        const businessRules = await getAllBusinessRules(limit, offset);
        return c.json({
          data: businessRules,
          pagination: {
            limit: limit || 'default',
            offset: offset || 'default',
          },
        });
      } catch (e) {
        logger.error('Failed to get Business Rules:', e);
        throw e;
      }
    }
  )

  /**
   * @description Get all use cases
   */
  .get(
    '/useCases',
    jwt({ secret: environment.jwtSecret }),
    adminMiddleware,
    processLimitOffset,
    async c => {
      try {
        const limit = c.get('limit');
        const offset = c.get('offset');
        const useCases = await getAllUseCases(limit, offset);
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
  );
