/**
 * @file questionValidator.ts
 * @description Validates and sanitizes a question.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies validator.ts, question.ts, zod, xss
 */

import { Validator } from '../../entities/validator.js';
import {
  BaseQuestionSchema,
  type BaseQuestion,
  QuestionSchema,
  type Question,
} from '../../entities/question.js';
import { z } from 'zod';
import xss from 'xss';

type ValidateBaseQuestionType = z.infer<
  ReturnType<typeof Validator<typeof BaseQuestionSchema>>
>;

type ValidateQuestionType = z.infer<
  ReturnType<typeof Validator<typeof QuestionSchema>>
>;

/**
 * Validates and sanitizes a base (new) question.
 * @param data - The base question to validate and sanitize.
 * @returns - The validated and sanitized base question or an error.
 */
export const validateAndSanitizeBaseQuestion = async (
  data: unknown
): Promise<ValidateBaseQuestionType> => {
  const parsed = await BaseQuestionSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData: BaseQuestion = {
    categoryId: parsed.data.categoryId,
    question: xss(parsed.data.question.trim()),
    answers: parsed.data.answers.map(a => ({
      answer: xss(a.answer.trim()),
      isCorrect: a.isCorrect,
    })),
  };

  return { data: sanitizedData };
};

/**
 * Validates and sanitizes a question.
 * @param data - The question to validate and sanitize.
 * @returns - The validated and sanitized question or an error.
 */
export const validateAndSanitizeQuestion = async (
  data: unknown
): Promise<ValidateQuestionType> => {
  const parsed = await QuestionSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData: Question = {
    id: parsed.data.id,
    categoryId: parsed.data.categoryId,
    slug: xss(parsed.data.slug),
    question: xss(parsed.data.question.trim()),
    answers: parsed.data.answers.map(a => ({
      answer: xss(a.answer.trim()),
      isCorrect: a.isCorrect,
    })),
  };

  return { data: sanitizedData };
};
