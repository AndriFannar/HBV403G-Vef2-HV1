/**
 * @file businessRules.routes.ts
 * @description Contains the routes for the businessRule endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies projectMiddleware, utilMiddleware, config/environment, io/logger, db/businessRules.db, validation/businessRuleValidator, hono/jwt, hono, http-status-codes, entities/context
 */

import { verifyProjectOwnership } from '../middleware/ownershipVerificationMiddleware.js';
import { jwtMiddleware } from '../middleware/authMiddleware.js';
import { getEnvironment } from '../lib/config/environment.js';
import type { Variables } from '../entities/context.js';
import { Hono, type Context, type Next } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/io/logger.js';
import {
  createBusinessRule,
  updateBusinessRule,
  deleteBusinessRule,
  getBusinessRuleById,
  getBusinessRulesByProjectId,
} from '../db/businessRules.db.js';
import {
  parseParamId,
  processLimitOffset,
} from '../middleware/utilMiddleware.js';
import {
  validateAndSanitizeNewBusinessRule,
  validateAndSanitizeBaseBusinessRule,
} from '../lib/validation/businessRuleValidator.js';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

/**
 * Fetches the business rule by ID from the request parameters and verifies if it belongs to the project.
 * @requires project to be fetched and set in the context under `project`.
 * @requires businessRuleId to be parsed and set in the context under `businessRuleId`.
 * @param c - The Hono context object.
 * @param next - The next middleware function.
 * @returns - A promise that resolves to the next middleware function.
 */
const fetchAndVerifyBusinessRule = async (c: Context, next: Next) => {
  const businessRuleId = c.get('businessRuleId');
  const project = c.get('project');

  const businessRule = await getBusinessRuleById(businessRuleId);

  if (!businessRule || businessRule.projectId !== project.id) {
    return c.json(
      {
        message:
          'No Bussiness Rule with corresponding ID found which belongs to given Project',
      },
      StatusCodes.NOT_FOUND
    );
  }

  c.set('businessRule', businessRule);
  return next();
};

export const businessRuleApp = new Hono<{ Variables: Variables }>()

  /**
   * @description Get business rules by project ID
   */
  .get(
    '/',
    jwtMiddleware,
    parseParamId('userId'),
    parseParamId('projectId'),
    verifyProjectOwnership(false),
    processLimitOffset,
    async c => {
      try {
        const project = c.get('project');
        const limit = c.get('limit');
        const offset = c.get('offset');

        const businessRules = await getBusinessRulesByProjectId(
          project.id,
          limit,
          offset
        );

        if (!businessRules) {
          return c.json(
            { message: 'No Business Rules found' },
            StatusCodes.NOT_FOUND
          );
        }

        return c.json({
          data: businessRules,
          pagination: {
            limit: limit || 'default',
            offset: offset || 'default',
          },
        });
      } catch (e) {
        logger.error('Failed to get Business Rules:', e);
        throw e;
      }
    }
  )

  /**
   * @description Get business rule by ID
   */
  .get(
    '/:businessRuleId',
    jwtMiddleware,
    parseParamId('userId'),
    parseParamId('projectId'),
    parseParamId('businessRuleId'),
    verifyProjectOwnership(false),
    fetchAndVerifyBusinessRule,
    async c => {
      try {
        return c.json({
          data: c.get('businessRule'),
        });
      } catch (e) {
        logger.error('Failed to get Business Rule:', e);
        throw e;
      }
    }
  )

  /**
   * @description Create a new business rule
   */
  .post(
    '/',
    jwtMiddleware,
    parseParamId('userId'),
    parseParamId('projectId'),
    verifyProjectOwnership(false),
    async c => {
      try {
        let newBusinessRule: unknown;
        try {
          newBusinessRule = await c.req.json();
        } catch {
          return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
        }

        const validBusinessRule =
          await validateAndSanitizeNewBusinessRule(newBusinessRule);

        if (!validBusinessRule.data) {
          return c.json(
            { message: 'Invalid data', errors: validBusinessRule.error },
            StatusCodes.BAD_REQUEST
          );
        }

        validBusinessRule.data.projectId = c.get('project').id;
        const createdBusinessRule = await createBusinessRule(
          validBusinessRule.data
        );
        return c.json(createdBusinessRule, StatusCodes.CREATED);
      } catch (e) {
        logger.error('Failed to create Business Rule:', e);
        throw e;
      }
    }
  )

  /**
   * @description Update a business rule by ID
   */
  .patch(
    '/:businessRuleId',
    jwtMiddleware,
    parseParamId('userId'),
    parseParamId('projectId'),
    parseParamId('businessRuleId'),
    verifyProjectOwnership(false),
    fetchAndVerifyBusinessRule,
    async c => {
      try {
        let updatedBusinessRuleInfo: unknown;
        try {
          updatedBusinessRuleInfo = await c.req.json();
        } catch {
          return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
        }

        const validBusinessRule = await validateAndSanitizeBaseBusinessRule(
          updatedBusinessRuleInfo
        );

        if (!validBusinessRule.data) {
          return c.json(
            { message: 'Invalid data', errors: validBusinessRule.error },
            StatusCodes.BAD_REQUEST
          );
        }

        validBusinessRule.data.id = c.get('businessRule').id;

        const updatedBusinessRule = await updateBusinessRule(
          validBusinessRule.data
        );
        return c.json(updatedBusinessRule);
      } catch (e) {
        logger.error('Failed to update Business Rule:', e);
        throw e;
      }
    }
  )

  /**
   * @description Delete a business rule by ID
   */
  .delete(
    '/:businessRuleId',
    jwtMiddleware,
    parseParamId('userId'),
    parseParamId('projectId'),
    parseParamId('businessRuleId'),
    verifyProjectOwnership(false),
    fetchAndVerifyBusinessRule,
    async c => {
      try {
        await deleteBusinessRule(c.get('businessRule').id);
        return c.body(null, StatusCodes.NO_CONTENT);
      } catch (e) {
        logger.error('Failed to delete Business Rule:', e);
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
