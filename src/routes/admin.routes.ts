/**
 * @file admin.routes.ts
 * @description Contains routes only accessible to administrators.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies adminMiddleware, config/environment, db/businessRules.db, db/projects.db, db/actor.db, db/users.db, lib/io/logger, hono/jwt, hono
 */

import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { getAllBusinessRules } from '../db/businessRules.db.js';
import { getEnvironment } from '../lib/config/environment.js';
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
    async c => {
      try {
        const projects = await getAllProjects();
        return c.json(projects);
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
    async c => {
      try {
        const actors = await getAllActors();
        return c.json(actors);
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
    async c => {
      try {
        const businessRules = await getAllBusinessRules();
        return c.json(businessRules);
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
    async c => {
      try {
        const useCases = await getAllUseCases();
        return c.json(useCases);
      } catch (e) {
        logger.error('Failed to get Use Cases:', e);
        throw e;
      }
    }
  );
