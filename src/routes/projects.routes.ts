/**
 * @file projects.routes.ts
 * @description Contains the routes for the project endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies projectMiddleware, config/environment, db/businessRules.db, db/projects.db, lib/io/logger, hono/jwt, hono
 */

import { verifyProjectOwnership } from '../middleware/ownershipVerificationMiddleware.js';
import { parseParamId } from '../middleware/utilMiddleware.js';
import { getEnvironment } from '../lib/config/environment.js';
import type { Variables } from '../entities/context.js';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/io/logger.js';
import { jwt } from 'hono/jwt';
import { Hono } from 'hono';
import {
  createProject,
  updateProject,
  deleteProject,
  getProjectSummaryByUserId,
} from '../db/projects.db.js';
import {
  validateAndSanitizeNewProject,
  validateAndSanitizeBaseProject,
} from '../lib/validation/projectValidator.js';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

export const projectApp = new Hono<{ Variables: Variables }>()
  /**
   * @description Get summary of projects by user ID
   */
  .get(
    '/summary',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    async c => {
      try {
        const userId = c.get('userId');

        if (c.get('jwtPayload').sub !== userId) {
          return c.json({ message: 'Unauthorized' }, StatusCodes.FORBIDDEN);
        }

        const limitStr = c.req.query('limit');
        const offsetStr = c.req.query('offset');

        const limit = limitStr ? parseInt(limitStr, 10) : undefined;
        const offset = offsetStr ? parseInt(offsetStr, 10) : undefined;

        const projects = await getProjectSummaryByUserId(userId, limit, offset);

        if (!projects) {
          return c.json(
            { message: 'No Projects found' },
            StatusCodes.NOT_FOUND
          );
        }

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
   * @description Get project by ID
   */
  .get(
    '/:projectId',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    verifyProjectOwnership(true),
    async c => {
      try {
        const project = c.get('project');

        return c.json({
          data: project,
        });
      } catch (e) {
        logger.error('Failed to get Project:', e);
        throw e;
      }
    }
  )

  /**
   * @description Create a new project
   */
  .post(
    '/',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    async c => {
      try {
        let newProject: unknown;
        try {
          newProject = await c.req.json();
        } catch {
          return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
        }

        const authenticatedUserId = c.get('jwtPayload').sub;

        if (authenticatedUserId !== c.get('userId')) {
          return c.json({ message: 'Unauthorized' }, StatusCodes.FORBIDDEN);
        }

        const validProject = await validateAndSanitizeNewProject(newProject);

        if (!validProject.data) {
          return c.json(
            { message: 'Invalid data', errors: validProject.error },
            StatusCodes.BAD_REQUEST
          );
        }

        validProject.data.ownerId = authenticatedUserId;
        const createdProject = await createProject(validProject.data);
        return c.json(createdProject, StatusCodes.CREATED);
      } catch (e) {
        logger.error('Failed to create Project:', e);
        throw e;
      }
    }
  )

  /**
   * @description Update a project by ID
   */
  .patch(
    '/:projectId',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    verifyProjectOwnership(false),
    async c => {
      try {
        let updatedProjectInfo: unknown;
        try {
          updatedProjectInfo = await c.req.json();
        } catch {
          return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
        }

        const authenticatedUserId = c.get('jwtPayload').sub;

        const validProject =
          await validateAndSanitizeBaseProject(updatedProjectInfo);

        if (!validProject.data) {
          return c.json(
            { message: 'Invalid data', errors: validProject.error },
            StatusCodes.BAD_REQUEST
          );
        }

        validProject.data.ownerId = authenticatedUserId;

        const updatedProject = await updateProject(validProject.data);
        return c.json(updatedProject);
      } catch (e) {
        logger.error('Failed to update Project:', e);
        throw e;
      }
    }
  )

  /**
   * @description Delete a project by ID
   */
  .delete(
    '/:projectId',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    verifyProjectOwnership(false),
    async c => {
      try {
        await deleteProject(c.get('projectId'));
        return c.body(null, StatusCodes.NO_CONTENT);
      } catch (e) {
        logger.error('Failed to delete Project:', e);
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
