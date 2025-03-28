/**
 * @file projectMiddleware.ts
 * @description Middleware that verifies that the user has access to a project.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies http-status-codes, hono, projects.db.js, @prisma/client
 */

import { getProjectSummaryById } from '../db/projects.db.js';
import { StatusCodes } from 'http-status-codes';
import type { Context, Next } from 'hono';
import { Role } from '@prisma/client';

/**
 * Verifies project exists and authenticated user has access to it.
 * If the project exists and user has access, it sets the summary project in the context.
 * @param c - The context object
 * @param next - The next middleware function
 * @returns - The next middleware function or an error response.
 */
export const verifyProject = async (c: Context, next: Next) => {
  const projectIdStr = c.req.param('projectId');
  if (!projectIdStr) {
    return c.json(
      { message: 'Project ID not provided' },
      StatusCodes.BAD_REQUEST
    );
  }

  const projId = parseInt(projectIdStr, 10);

  if (isNaN(projId)) {
    return c.json({ message: 'Invalid ID' }, StatusCodes.BAD_REQUEST);
  }

  const payload = await c.get('jwtPayload');

  const project = await getProjectSummaryById(projId);
  if (!project) {
    return c.json({ message: 'Project not found' }, StatusCodes.NOT_FOUND);
  }
  if (project.ownerId !== payload.id && payload.role !== Role.ADMIN) {
    return c.json({ message: 'Unauthorized' }, StatusCodes.FORBIDDEN);
  }

  c.set('project', project);
  return next();
};
