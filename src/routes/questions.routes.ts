/**
 * @file questions.ts
 * @description Contains the routes for the questions endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies hono, logger.ts, slugValidator.ts, questionValidator.ts, questions.db.ts, http-status-codes
 */

import { validateAndSanitizeSlug } from '../lib/validation/slugValidator.js';
import { getEnvironment } from '../lib/config/environment.js';
import { StatusCodes } from 'http-status-codes';
import {
  validateAndSanitizeBaseQuestion,
  validateAndSanitizeQuestion,
} from '../lib/validation/questionValidator.js';
import { logger } from '../lib/io/logger.js';
import {
  getAllQuestions,
  createQuestion,
  getQuestionsByCategory,
  getQuestionBySlug,
  updateQuestion,
  deleteQuestion,
} from '../db/questions.db.js';
import { jwt } from 'hono/jwt';
import { Hono } from 'hono';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

export const questionsApp = new Hono()

  /**
   * @description Get all questions
   */
  .get('/', jwt({ secret: environment.jwtSecret }), async c => {
    try {
      const questions = await getAllQuestions();
      return c.json(questions, StatusCodes.OK);
    } catch (e) {
      logger.error('Failed to get questions:', e);
      throw e;
    }
  })

  /**
   * @description Get questions by category via a category slug
   */
  .get('/:slug', async c => {
    try {
      const slug = await validateAndSanitizeSlug(c.req.param('slug'));
      if (!slug.data) {
        return c.json({ message: 'Invalid slug' }, StatusCodes.BAD_REQUEST);
      }

      const questionsInCat = await getQuestionsByCategory(slug.data);

      if (!questionsInCat) {
        return c.json({ message: 'Category not found' }, StatusCodes.NOT_FOUND);
      }

      return c.json(questionsInCat, StatusCodes.OK);
    } catch (e) {
      logger.error('Failed to get category:', e);
      throw e;
    }
  })

  /**
   * @description Create a new question
   */
  .post('/', async c => {
    try {
      let newQuestion: unknown;
      try {
        newQuestion = await c.req.json();
      } catch {
        return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
      }

      const validQuestion = await validateAndSanitizeBaseQuestion(newQuestion);

      if (!validQuestion.data) {
        return c.json(
          { message: 'Invalid data', errors: validQuestion.error },
          StatusCodes.BAD_REQUEST
        );
      }

      const createdQuestion = await createQuestion(validQuestion.data);
      return c.json(createdQuestion, StatusCodes.CREATED);
    } catch (e) {
      logger.error('Failed to create question:', e);
      throw e;
    }
  })

  /**
   * @description Update a question by slug
   */
  .patch('/:slug', async c => {
    try {
      let updatedQuestionInfo: unknown;
      try {
        updatedQuestionInfo = await c.req.json();
      } catch {
        return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
      }

      const slug = await validateAndSanitizeSlug(c.req.param('slug'));
      if (!slug.data) {
        return c.json({ message: 'Invalid slug' }, StatusCodes.BAD_REQUEST);
      }

      const validQuestion =
        await validateAndSanitizeQuestion(updatedQuestionInfo);

      if (!validQuestion.data) {
        return c.json(
          { message: 'Invalid data', errors: validQuestion.error },
          StatusCodes.BAD_REQUEST
        );
      }

      const updatedQuestion = await updateQuestion(
        c.req.param('slug'),
        validQuestion.data
      );

      if (!updatedQuestion) {
        return c.json({ message: 'Question not found' }, StatusCodes.NOT_FOUND);
      }

      return c.json(updatedQuestion);
    } catch (e) {
      logger.error('Failed to update question:', e);
      throw e;
    }
  })

  /**
   * @description Delete a question by slug
   */
  .delete('/:slug', async c => {
    try {
      const slug = await validateAndSanitizeSlug(c.req.param('slug'));
      if (!slug.data) {
        return c.json({ message: 'Invalid slug' }, StatusCodes.BAD_REQUEST);
      }

      if ((await getQuestionBySlug(slug.data)) === null) {
        return c.json({ message: 'Question not found' }, StatusCodes.NOT_FOUND);
      }

      await deleteQuestion(slug.data);
      return c.body(null, StatusCodes.NO_CONTENT);
    } catch (e) {
      logger.error('Failed to delete question:', e);
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
