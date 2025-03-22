/**
 * @file conditionValidator.ts
 * @description Validates and sanitizes a condition.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, sanitizeString, @prisma/client, condition.js
 */

import { BaseConditionSchema } from '../../entities/condition.js';
import { Validator } from '../../entities/validator.js';
import { sanitizeString } from './sanitizeString.js';
import { z } from 'zod';

type ValidateCondition = z.infer<
  ReturnType<typeof Validator<typeof BaseConditionSchema>>
>;

/**
 * Validates and sanitizes a base (new) condition.
 * @param data - The condition data to validate and sanitize.
 * @returns An object with either the sanitized data or an error.
 */
export const validateAndSanitizeBaseCondition = async (
  data: unknown
): Promise<ValidateCondition> => {
  const parsed = await BaseConditionSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = {
    useCaseId: parsed.data.useCaseId,
    description: sanitizeString(parsed.data.description),
    conditionType: parsed.data.conditionType,
  };

  return { data: sanitizedData };
};
