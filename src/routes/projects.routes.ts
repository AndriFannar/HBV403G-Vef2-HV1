/**
 * @file projects.routes.ts
 * @description Contains the routes for the project endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies projectMiddleware, config/environment, db/businessRules.db, db/projects.db, lib/io/logger, hono/jwt, hono
 */

import { verifyProjectOwnership } from '../middleware/ownershipVerificationMiddleware.js';
import { jwtMiddleware } from '../middleware/authMiddleware.js';
import { getEnvironment } from '../lib/config/environment.js';
import { uploadImage } from '../lib/cloudinary/cloudinary.js';
import type { Variables } from '../entities/context.js';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/io/logger.js';
import { Hono } from 'hono';
import {
  createProject,
  updateProject,
  deleteProject,
  getProjectSummaryByUserId,
} from '../db/projects.db.js';
import {
  parseParamId,
  processLimitOffset,
} from '../middleware/utilMiddleware.js';
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
    jwtMiddleware,
    parseParamId('userId'),
    processLimitOffset,
    async c => {
      try {
        const userId = c.get('userId');

        if (c.get('jwtPayload').sub !== userId) {
          return c.json({ message: 'Unauthorized' }, StatusCodes.UNAUTHORIZED);
        }

        const limit = c.get('limit');
        const offset = c.get('offset');

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
    jwtMiddleware,
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
  .post('/', jwtMiddleware, parseParamId('userId'), async c => {
    try {
      const formData = await c.req.formData();
      const dataString = formData.get('data');

      if (!dataString || typeof dataString !== 'string') {
        return c.json({ message: 'Invalid data' }, StatusCodes.BAD_REQUEST);
      }

      let newProject: unknown;
      try {
        newProject = JSON.parse(dataString);
      } catch {
        return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
      }

      const authenticatedUserId = c.get('jwtPayload').sub;

      if (authenticatedUserId !== c.get('userId')) {
        return c.json({ message: 'Unauthorized' }, StatusCodes.UNAUTHORIZED);
      }

      const validProject = await validateAndSanitizeNewProject(newProject);

      if (!validProject.data) {
        return c.json(
          { message: 'Invalid data', errors: validProject.error },
          StatusCodes.BAD_REQUEST
        );
      }

      validProject.data.ownerId = authenticatedUserId;
      let createdProject = await createProject(validProject.data);

      const imageUrl = await uploadImage(
        formData.get('image'),
        createdProject.id
      );

      if (imageUrl) {
        createdProject.imageUrl = imageUrl;

        const updatedProject = await updateProject(createdProject);
        if (updatedProject) {
          createdProject = updatedProject;
        } else {
          return c.json(
            { message: 'Failed to update project with image URL' },
            StatusCodes.INTERNAL_SERVER_ERROR
          );
        }
      }

      return c.json(createdProject, StatusCodes.CREATED);
    } catch (e) {
      logger.error('Failed to create Project:', e);
      throw e;
    }
  })

  /**
   * @description Update a project by ID
   */
  .patch(
    '/:projectId',
    jwtMiddleware,
    parseParamId('userId'),
    parseParamId('projectId'),
    verifyProjectOwnership(false),
    async c => {
      try {
        const formData = await c.req.formData();
        const dataString = formData.get('data');

        if (!dataString || typeof dataString !== 'string') {
          return c.json({ message: 'Invalid data' }, StatusCodes.BAD_REQUEST);
        }

        let updatedProjectInfo: unknown;
        try {
          updatedProjectInfo = JSON.parse(dataString);
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

        const imageUrl = await uploadImage(
          formData.get('image'),
          c.get('project').id
        );

        if (imageUrl) {
          validProject.data.imageUrl = imageUrl;
        }

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
    jwtMiddleware,
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
