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
 * @requires jwtPayload to be parsed and set in the context under `jwtPayload`.
 * @requires userId to be parsed and set in the context under `userId`.
 * @requires projectId to be parsed and set in the context under `projectId`.
 * @param c - The context object
 * @param next - The next middleware function
 * @returns - The next middleware function or an error response.
 */
export const verifyProjectOwnership = async (c: Context, next: Next) => {
  const payload = await c.get('jwtPayload');
  const userId = await c.get('userId');
  const projectId = c.get('projectId');

  if (isNaN(projectId)) {
    return c.json({ message: 'Invalid ID' }, StatusCodes.BAD_REQUEST);
  }

  const project = await getProjectSummaryById(projectId);
  if (!project) {
    return c.json({ message: 'Project not found' }, StatusCodes.NOT_FOUND);
  }
  if (
    !(project.ownerId === payload.sub && payload.sub === userId) ||
    payload.role !== Role.ADMIN
  ) {
    return c.json({ message: 'Unauthorized' }, StatusCodes.FORBIDDEN);
  }

  c.set('project', project);
  return next();
};
