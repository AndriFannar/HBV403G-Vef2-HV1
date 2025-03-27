/**
 * @file businessRuleValidator.ts
 * @description Validates and sanitizes a business rule.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, sanitizeString, businessRule.js, validator.js
 */

import { NewBusinessRuleSchema } from '../../entities/businessRule.js';
import { Validator } from '../../entities/validator.js';
import { sanitizeString } from './sanitizeString.js';
import { z } from 'zod';

type ValidateBusinessRule = z.infer<
  ReturnType<typeof Validator<typeof NewBusinessRuleSchema>>
>;

/**
 * Validates and sanitizes a base (new) business rule.
 * @param data - The business rule data to validate and sanitize.
 * @returns An object with either the sanitized data or an error.
 */
export const validateAndSanitizeBaseBusinessRule = async (
  data: unknown
): Promise<ValidateBusinessRule> => {
  const parsed = await NewBusinessRuleSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = {
    ...parsed.data,
    ruleDef: sanitizeString(parsed.data.ruleDef),
    source: sanitizeString(parsed.data.source),
  };

  return { data: sanitizedData };
};
