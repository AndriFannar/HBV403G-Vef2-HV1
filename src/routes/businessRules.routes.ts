/**
 * @file businessRules.routes.ts
 * @description Contains the routes for the businessRule endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies
 */

import { Hono, type Context, type Next } from 'hono';
import { getEnvironment } from '../lib/config/environment.js';
import { logger } from '../lib/io/logger.js';
import { jwt } from 'hono/jwt';
import { parseParamId } from '../middleware/utilMiddleware.js';
import { verifyProjectOwnership } from '../middleware/projectMiddleware.js';
import type { Variables } from '../entities/context.js';
import {
  createBusinessRule,
  deleteBusinessRule,
  getBusinessRuleById,
  getBusinessRulesByProjectId,
  updateBusinessRule,
} from '../db/businessRules.db.js';
import { StatusCodes } from 'http-status-codes';
import {
  validateAndSanitizeBaseBusinessRule,
  validateAndSanitizeNewBusinessRule,
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
   * @description Get actors by project ID
   */
  .get(
    '/',
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    verifyProjectOwnership,
    async c => {
      try {
        const project = c.get('project');
        const limitStr = c.req.query('limit');
        const offsetStr = c.req.query('offset');

        const limit = limitStr ? parseInt(limitStr, 10) : undefined;
        const offset = offsetStr ? parseInt(offsetStr, 10) : undefined;

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
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    parseParamId('businessRuleId'),
    verifyProjectOwnership,
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
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    verifyProjectOwnership,
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
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    parseParamId('businessRuleId'),
    verifyProjectOwnership,
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
    jwt({ secret: environment.jwtSecret }),
    parseParamId('userId'),
    parseParamId('projectId'),
    parseParamId('businessRuleId'),
    verifyProjectOwnership,
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
