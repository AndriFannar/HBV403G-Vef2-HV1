/**
 * @file answer.ts
 * @description A schema for validating answers.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies zod
 */

import { z } from 'zod';

const minContentLength = 3;
const maxContentLength = 500;

/**
 * A schema for validating base (new) answers.
 */
export const BaseAnswerSchema = z.object({
  answer: z
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
  isCorrect: z.boolean(),
});

/**
 * A schema for validating answers.
 */
export const AnswerSchema = BaseAnswerSchema.extend({
  id: z.number(),
  questionId: z.number(),
});

export type BaseAnswer = z.infer<typeof BaseAnswerSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
