/**
 * @file ownershipVerificationMiddleware.ts
 * @description Middleware that verifies that the user has access to a specific entity.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies http-status-codes, hono, projects.db.js, @prisma/client
 */

import { getProjectById, getProjectSummaryById } from '../db/projects.db.js';
import { StatusCodes } from 'http-status-codes';
import type { Context, Next } from 'hono';
import { Role } from '@prisma/client';
import { getUseCaseById, getUseCaseSummaryById } from '../db/useCases.db.js';

/**
 * Verifies project exists and authenticated user has access to it.
 * If the project exists and user has access, it sets the summary project in the context (or full project if set).
 * @requires jwtPayload to be parsed and set in the context under `jwtPayload`.
 * @requires userId to be parsed and set in the context under `userId`.
 * @requires projectId to be parsed and set in the context under `projectId`.
 * @param full - If true, fetches the full project instead of the summary.
 * @param c - The context object
 * @param next - The next middleware function
 * @returns - The next middleware function or an error response.
 */
export const verifyProjectOwnership =
  (full: boolean = false) =>
  async (c: Context, next: Next) => {
    const payload = await c.get('jwtPayload');
    const userId = await c.get('userId');
    const projectId = await c.get('projectId');

    let project;
    if (full) {
      project = await getProjectById(projectId);
    } else {
      project = await getProjectSummaryById(projectId);
    }

    if (!project) {
      return c.json({ message: 'Project not found' }, StatusCodes.NOT_FOUND);
    }
    if (
      !(project.ownerId === payload.sub && payload.sub === userId) ||
      payload.role !== Role.ADMIN
    ) {
      return c.json({ message: 'Unauthorized' }, StatusCodes.UNAUTHORIZED);
    }

    c.set('project', project);
    return next();
  };

/**
 * Verifies useCase exists and authenticated user has access to it.
 * If the useCase exists and user has access, it sets the summary use case in the context (or full use case if set).
 * @requires jwtPayload to be parsed and set in the context under `jwtPayload`.
 * @requires userId to be parsed and set in the context under `userId`.
 * @requires projectId to be parsed and set in the context under `projectId`.
 * @requires useCaseId to be parsed and set in the context under `useCaseId`.
 * @param full - If true, fetches the full use case instead of the summary.
 * @param c - The context object
 * @param next - The next middleware function
 * @returns - The next middleware function or an error response.
 */
export const verifyUseCaseOwnership =
  (full: boolean = false) =>
  async (c: Context, next: Next) => {
    const payload = await c.get('jwtPayload');
    const userId = await c.get('userId');
    const projectId = await c.get('projectId');
    const useCaseId = await c.get('useCaseId');

    let useCase;
    if (full) {
      useCase = await getUseCaseById(useCaseId);
    } else {
      useCase = await getUseCaseSummaryById(useCaseId);
    }

    if (!useCase) {
      return c.json({ message: 'Use Case not found' }, StatusCodes.NOT_FOUND);
    }
    if (
      !(useCase.creatorId === payload.sub && payload.sub === userId) ||
      useCase.projectId !== projectId ||
      payload.role !== Role.ADMIN
    ) {
      return c.json({ message: 'Unauthorized' }, StatusCodes.UNAUTHORIZED);
    }

    c.set('useCase', useCase);
    return next();
  };
