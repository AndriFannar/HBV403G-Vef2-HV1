/**
 * @file question.ts
 * @description A schema for validating questions.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies zod, answer.ts
 */

import { BaseAnswerSchema } from './answer.js';
import { z } from 'zod';

const maxContentLength = 500;
const minContentLength = 3;
const minNoAnswers = 2;

/**
 * A schema for validating new questions.
 */
export const BaseQuestionSchema = z.object({
  categoryId: z.number(),
  question: z
    .string()
    .min(
      minContentLength,
      `Content must be at least ${minContentLength} letters`
    )
    .max(
      maxContentLength,
      `Content must be at most ${maxContentLength} letters`
    )
    .nonempty(),
  answers: z
    .array(BaseAnswerSchema)
    .length(minNoAnswers, `Question must have ${minNoAnswers} answers`),
});

/**
 * A schema for validating questions.
 */
export const QuestionSchema = BaseQuestionSchema.extend({
  id: z.number(),
  slug: z.string().nonempty(),
});

export type BaseQuestion = z.infer<typeof BaseQuestionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
