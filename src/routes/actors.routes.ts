/**
 * @file actors.routes.ts
 * @description Contains the routes for the actor endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies
 */

import { validateAndSanitizeSlug } from '../lib/validation/slugValidator.js';
import { getEnvironment } from '../lib/config/environment.js';
import { getActorById, getActorsByProjectId } from '../db/actor.db.js';
import { getProjectById } from '../db/projects.db.js';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/io/logger.js';
import { Role } from '@prisma/client';
import { jwt } from 'hono/jwt';
import { Hono } from 'hono';
import { verifyProject } from '../middleware/projectMiddleware.js';
import type { Variables } from '../entities/context.js';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

export const actorApp = new Hono<{ Variables: Variables }>()

  /**
   * @description Get actors by project ID
   */
  .get('/', jwt({ secret: environment.jwtSecret }), async c => {
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
        pagination: { limit: limit || 'default', offset: offset || 'default' },
      });
    } catch (e) {
      logger.error('Failed to get actors:', e);
      throw e;
    }
  })

  /**
   * @description Get actor by ID
   */
  .get(
    '/:id',
    jwt({ secret: environment.jwtSecret }),
    verifyProject,
    async c => {
      try {
        const project = c.get('project');

        const actor = await getActorById(project.id);

        if (!actor) {
          return c.json({ message: 'No actor found' }, StatusCodes.NOT_FOUND);
        }

        return c.json({
          data: actor,
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
  .post('/', async c => {
    try {
      let newCategory: unknown;
      try {
        newCategory = await c.req.json();
      } catch {
        return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
      }

      const validCategory = await validateAndSanitizeBaseCategory(newCategory);

      if (!validCategory.data) {
        return c.json(
          { message: 'Invalid data', errors: validCategory.error },
          StatusCodes.BAD_REQUEST
        );
      }

      const createdCategory = await createCategory(validCategory.data);
      return c.json(createdCategory, StatusCodes.CREATED);
    } catch (e) {
      logger.error('Failed to create category:', e);
      throw e;
    }
  })

  /**
   * @description Update a category by slug
   */
  .patch('/:slug', async c => {
    try {
      let updatedCategoryInfo: unknown;
      try {
        updatedCategoryInfo = await c.req.json();
      } catch {
        return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
      }

      const slug = await validateAndSanitizeSlug(c.req.param('slug'));
      if (!slug.data) {
        return c.json({ message: 'Invalid slug' }, StatusCodes.BAD_REQUEST);
      }

      if ((await getCategory(slug.data)) === null) {
        return c.json({ message: 'Category not found' }, StatusCodes.NOT_FOUND);
      }

      const validCategory =
        await validateAndSanitizeBaseCategory(updatedCategoryInfo);

      if (!validCategory.data) {
        return c.json(
          { message: 'Invalid data', errors: validCategory.error },
          StatusCodes.BAD_REQUEST
        );
      }

      const updatedCategory = await updateCategory(
        c.req.param('slug'),
        validCategory.data
      );
      return c.json(updatedCategory);
    } catch (e) {
      logger.error('Failed to update category:', e);
      throw e;
    }
  })

  /**
   * @description Delete a category by slug
   */
  .delete('/:slug', async c => {
    try {
      const slug = await validateAndSanitizeSlug(c.req.param('slug'));
      if (!slug.data) {
        return c.json({ message: 'Invalid slug' }, StatusCodes.BAD_REQUEST);
      }

      if ((await getCategory(slug.data)) === null) {
        return c.json({ message: 'Category not found' }, StatusCodes.NOT_FOUND);
      }

      await deleteCategory(slug.data);
      return c.body(null, StatusCodes.NO_CONTENT);
    } catch (e) {
      logger.error('Failed to delete category:', e);
      throw e;
    }
  })

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
