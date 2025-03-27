/**
 * @file actorRoutes.ts
 * @description Contains the routes for the actoe endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies
 */

import { validateAndSanitizeNewActor } from '../lib/validation/actorValidator.js';
import { validateAndSanitizeSlug } from '../lib/validation/slugValidator.js';
import { getActorsByProjectId, getAllActors } from '../db/actor.db.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { getEnvironment } from '../lib/config/environment.js';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/io/logger.js';
import { jwt } from 'hono/jwt';
import { Hono } from 'hono';
import { Role } from '@prisma/client';
import { getProjectById } from '../db/projects.db.js';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

export const actorApp = new Hono()

  /**
   * @description Get all actors
   */
  .get(
    '/',
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
  )

  /**
   * @description Get actors by project ID
   */
  .get('/:id', jwt({ secret: environment.jwtSecret }), async c => {
    try {
      const id = parseInt(c.req.param('id'), 10);

      if (isNaN(id)) {
        return c.json({ message: 'Invalid ID' }, StatusCodes.BAD_REQUEST);
      }

      const payload = await c.get('jwtPayload');

      const project = await getProjectById(id);
      if (!project) {
        return c.json({ message: 'Project not found' }, StatusCodes.NOT_FOUND);
      }
      if (project.ownerId !== payload.id && payload.role !== Role.ADMIN) {
        return c.json({ message: 'Unauthorized' }, StatusCodes.FORBIDDEN);
      }

      const actors = await getActorsByProjectId(id);

      if (!actors) {
        return c.json({ message: 'No actors found' }, StatusCodes.NOT_FOUND);
      }

      return c.json(actors);
    } catch (e) {
      logger.error('Failed to get actors:', e);
      throw e;
    }
  })

  /**
   * @description Create a new category
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
