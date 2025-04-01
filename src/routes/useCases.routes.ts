/**
 * @file useCases.routes.ts
 * @description Contains the routes for the useCase endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies
 */

import { validateAndSanitizeNewUseCase } from '../lib/validation/useCaseValidator.js';
import { getEnvironment } from '../lib/config/environment.js';
import type { Variables } from '../entities/context.js';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/io/logger.js';
import { jwt } from 'hono/jwt';
import { Hono } from 'hono';
import {
  createUseCase,
  updateUseCase,
  deleteUseCase,
  getUseCasesSummaryByProjectId,
} from '../db/useCases.db.js';
import {
  parseParamId,
  processLimitOffset,
} from '../middleware/utilMiddleware.js';
import {
  verifyProjectOwnership,
  verifyUseCaseOwnership,
} from '../middleware/ownershipVerificationMiddleware.js';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

export const useCaseApp = new Hono<{ Variables: Variables }>()
  /**
   * @description Get summary of use cases by project ID
   */
  .get(
    '/summary',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    verifyProjectOwnership(false),
    processLimitOffset,
    async c => {
      try {
        const projectId = c.get('projectId');
        const limit = c.get('limit');
        const offset = c.get('offset');

        const useCases = await getUseCasesSummaryByProjectId(
          projectId,
          limit,
          offset
        );

        if (!useCases) {
          return c.json(
            { message: 'No Use Cases found' },
            StatusCodes.NOT_FOUND
          );
        }

        return c.json({
          data: useCases,
          pagination: {
            limit: limit || 'default',
            offset: offset || 'default',
          },
        });
      } catch (e) {
        logger.error('Failed to get Use Cases:', e);
        throw e;
      }
    }
  )

  /**
   * @description Get use case by ID
   */
  .get(
    '/:useCaseId',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    parseParamId('useCaseId'),
    verifyUseCaseOwnership(true),
    async c => {
      try {
        const useCase = c.get('useCase');

        return c.json({
          data: useCase,
        });
      } catch (e) {
        logger.error('Failed to get Use Case:', e);
        throw e;
      }
    }
  )

  /**
   * @description Create a new use case
   */
  .post(
    '/',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    verifyProjectOwnership(false),
    async c => {
      try {
        let newUseCase: unknown;
        try {
          newUseCase = await c.req.json();
        } catch {
          return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
        }

        const authenticatedUserId = c.get('jwtPayload').sub;

        const validUseCase = await validateAndSanitizeNewUseCase(newUseCase);

        if (!validUseCase.data) {
          return c.json(
            { message: 'Invalid data', errors: validUseCase.error },
            StatusCodes.BAD_REQUEST
          );
        }

        validUseCase.data.creatorId = authenticatedUserId;
        validUseCase.data.projectId = c.get('projectId');
        const createdUseCase = await createUseCase(validUseCase.data);
        return c.json(createdUseCase, StatusCodes.CREATED);
      } catch (e) {
        logger.error('Failed to create Use Case:', e);
        throw e;
      }
    }
  )

  /**
   * @description Update a use case by ID
   */
  .patch(
    '/:useCaseId',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    parseParamId('useCaseId'),
    verifyUseCaseOwnership(false),
    async c => {
      try {
        let updatedUseCaseInfo: unknown;
        try {
          updatedUseCaseInfo = await c.req.json();
        } catch {
          return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
        }

        const authenticatedUserId = c.get('jwtPayload').sub;

        const validUseCase =
          await validateAndSanitizeNewUseCase(updatedUseCaseInfo);

        if (!validUseCase.data) {
          return c.json(
            { message: 'Invalid data', errors: validUseCase.error },
            StatusCodes.BAD_REQUEST
          );
        }

        validUseCase.data.id = c.get('useCaseId');
        validUseCase.data.projectId = c.get('projectId');
        validUseCase.data.creatorId = authenticatedUserId;

        const updatedProject = await updateUseCase(validUseCase.data);
        return c.json(updatedProject);
      } catch (e) {
        logger.error('Failed to update Use Case:', e);
        throw e;
      }
    }
  )

  /**
   * @description Delete a use case by ID
   */
  .delete(
    '/:useCaseId',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    parseParamId('useCaseId'),
    verifyUseCaseOwnership(false),
    async c => {
      try {
        await deleteUseCase(c.get('useCaseId'));
        return c.body(null, StatusCodes.NO_CONTENT);
      } catch (e) {
        logger.error('Failed to delete Use Case:', e);
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
