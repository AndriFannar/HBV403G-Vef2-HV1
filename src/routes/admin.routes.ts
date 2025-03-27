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
import { logger } from '../lib/io/logger.js';
import { Hono } from 'hono';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

export const adminApp = new Hono()

  /**
   * @description Get all actors
   */
  .get('/actors', adminMiddleware, async c => {
    try {
      const actors = await getAllActors();
      return c.json(actors);
    } catch (e) {
      logger.error('Failed to get actors:', e);
      throw e;
    }
  });
