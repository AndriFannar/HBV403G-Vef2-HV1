/**
 * @file actors.routes.ts
 * @description Contains the routes for the actor endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies
 */

import { verifyProject } from '../middleware/projectMiddleware.js';
import { getEnvironment } from '../lib/config/environment.js';
import { parseParamId } from '../middleware/utilMiddleware.js';
import type { Variables } from '../entities/context.js';
import { Hono, type Context, type Next } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/io/logger.js';
import { jwt } from 'hono/jwt';
import {
  createActor,
  deleteActor,
  updateActor,
  getActorById,
  getActorsByProjectId,
} from '../db/actor.db.js';
import {
  validateAndSanitizeBaseActor,
  validateAndSanitizeNewActor,
} from '../lib/validation/actorValidator.js';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

/**
 * Fetches the actor by ID from the request parameters and verifies if it belongs to the project.
 * @requires ID to be parsed and set in the context under `id`.
 * @param c - The Hono context object.
 * @param next - The next middleware function.
 * @returns - A promise that resolves to the next middleware function.
 */
const fetchAndVerifyActor = async (c: Context, next: Next) => {
  const actorId = c.get('actorId');
  const project = c.get('project');

  const actor = await getActorById(actorId);

  if (!actor || actor.projectId !== project.id) {
    return c.json(
      {
        message:
          'No actor with corresponding ID found which belongs to given project',
      },
      StatusCodes.NOT_FOUND
    );
  }

  c.set('actor', actor);
  return next();
};

export const actorApp = new Hono<{ Variables: Variables }>()

  /**
   * @description Get actors by project ID
   */
  .get(
    '/',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('projectId'),
    verifyProject,
    async c => {
      try {
        const project = c.get('project');
        const limitStr = c.req.query('limit');
        const offsetStr = c.req.query('offset');

        const limit = limitStr ? parseInt(limitStr, 10) : undefined;
        const offset = offsetStr ? parseInt(offsetStr, 10) : undefined;

        const actors = await getActorsByProjectId(project.id, limit, offset);

        if (!actors) {
          return c.json({ message: 'No actors found' }, StatusCodes.NOT_FOUND);
        }

        return c.json({
          data: actors,
          pagination: {
            limit: limit || 'default',
            offset: offset || 'default',
          },
        });
      } catch (e) {
        logger.error('Failed to get actors:', e);
        throw e;
      }
    }
  )

  /**
   * @description Get actor by ID
   */
  .get(
    '/:actorId',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('projectId'),
    parseParamId('id'),
    verifyProject,
    fetchAndVerifyActor,
    async c => {
      try {
        return c.json({
          data: c.get('actor'),
        });
      } catch (e) {
        logger.error('Failed to get actors:', e);
        throw e;
      }
    }
  )

  /**
   * @description Create a new actor
   */
  .post(
    '/',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('projectId'),
    parseParamId('id'),
    verifyProject,
    async c => {
      try {
        let newActor: unknown;
        try {
          newActor = await c.req.json();
        } catch {
          return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
        }

        const validActor = await validateAndSanitizeNewActor(newActor);

        if (!validActor.data) {
          return c.json(
            { message: 'Invalid data', errors: validActor.error },
            StatusCodes.BAD_REQUEST
          );
        }

        const createdActor = await createActor(validActor.data);
        return c.json(createdActor, StatusCodes.CREATED);
      } catch (e) {
        logger.error('Failed to create actor:', e);
        throw e;
      }
    }
  )

  /**
   * @description Update an actor by ID
   */
  .patch(
    '/:actorId',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('projectId'),
    parseParamId('actorId'),
    verifyProject,
    fetchAndVerifyActor,
    async c => {
      try {
        let updatedActorInfo: unknown;
        try {
          updatedActorInfo = await c.req.json();
        } catch {
          return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
        }

        const validActor = await validateAndSanitizeBaseActor(updatedActorInfo);

        if (!validActor.data) {
          return c.json(
            { message: 'Invalid data', errors: validActor.error },
            StatusCodes.BAD_REQUEST
          );
        }

        validActor.data.id = c.get('actor').id;

        const updatedActor = await updateActor(validActor.data);
        return c.json(updatedActor);
      } catch (e) {
        logger.error('Failed to update actor:', e);
        throw e;
      }
    }
  )

  /**
   * @description Delete an actor by ID
   */
  .delete(
    '/:actorId',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('projectId'),
    parseParamId('actorId'),
    verifyProject,
    fetchAndVerifyActor,
    async c => {
      try {
        await deleteActor(c.get('actor').id);
        return c.body(null, StatusCodes.NO_CONTENT);
      } catch (e) {
        logger.error('Failed to delete actor:', e);
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
