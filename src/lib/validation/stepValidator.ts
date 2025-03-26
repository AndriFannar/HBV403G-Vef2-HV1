/**
 * @file stepValidator.ts
 * @description Validates and sanitizes a step.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, sanitizeString, @prisma/client, step.js
 */

import { NewStepSchema } from '../../entities/step.js';
import { Validator } from '../../entities/validator.js';
import { sanitizeString } from './sanitizeString.js';
import { z } from 'zod';

type ValidateStep = z.infer<
  ReturnType<typeof Validator<typeof NewStepSchema>>
>;

/**
 * Validates and sanitizes a base (new) step.
 * @param data - The step data to validate and sanitize.
 * @returns An object with either the sanitized data or an error.
 */
export const validateAndSanitizeBaseStep = async (
  data: unknown
): Promise<ValidateStep> => {
  const parsed = await NewStepSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = {
    step: sanitizeString(parsed.data.step),
    refs: parsed.data.refs,
    flowId: parsed.data.flowId,
  };

  return { data: sanitizedData };
};
