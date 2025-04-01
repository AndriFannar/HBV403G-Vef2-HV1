/**
 * @file businessRuleValidator.ts
 * @description Validates and sanitizes a business rule.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, sanitizeString, businessRule.js, validator.js
 */

import {
  BaseBusinessRuleSchema,
  NewBusinessRuleSchema,
} from '../../entities/businessRule.js';
import { Validator } from '../../entities/validator.js';
import { sanitizeString } from './sanitizeString.js';
import { z } from 'zod';

type ValidateNewBusinessRule = z.infer<
  ReturnType<typeof Validator<typeof NewBusinessRuleSchema>>
>;

type ValidateBaseBusinessRule = z.infer<
  ReturnType<typeof Validator<typeof BaseBusinessRuleSchema>>
>;

/**
 * Validates and sanitizes a new business rule.
 * @param data - The business rule data to validate and sanitize.
 * @returns An object with either the sanitized data or an error.
 */
export const validateAndSanitizeNewBusinessRule = async (
  data: unknown
): Promise<ValidateNewBusinessRule> => {
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

/**
 * Validates and sanitizes a base business rule.
 * @param data - The base business rule data to validate and sanitize.
 * @returns - The validated and sanitized business rule or an error.
 */
export const validateAndSanitizeBaseBusinessRule = async (
  data: unknown
): Promise<ValidateBaseBusinessRule> => {
  const parsed = await BaseBusinessRuleSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = await validateAndSanitizeNewBusinessRule(parsed.data);

  if (!sanitizedData.data) {
    return { error: sanitizedData.error };
  }

  return {
    data: {
      ...sanitizedData.data,
      id: parsed.data.id,
      publicId: sanitizeString(parsed.data.publicId),
      projectId: parsed.data.projectId,
    },
  };
};
