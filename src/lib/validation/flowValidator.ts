/**
 * @file flowValidator.ts
 * @description Validates and sanitizes a flow.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, sanitizeString, @prisma/client, flow.js
 */

import { BaseFlowSchema } from '../../entities/flow.js';
import { Validator } from '../../entities/validator.js';
import { sanitizeString } from './sanitizeString.js';
import { z } from 'zod';

type ValidateFlow = z.infer<
  ReturnType<typeof Validator<typeof BaseFlowSchema>>
>;

/**
 * Validates and sanitizes a base (new) flow.
 * @param data - The flow data to validate and sanitize.
 * @returns An object with either the sanitized data or an error.
 */
export const validateAndSanitizeBaseFlow = async (
  data: unknown
): Promise<ValidateFlow> => {
  const parsed = await BaseFlowSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = {
    name: sanitizeString(parsed.data.name),
    flowType: parsed.data.flowType,
    steps: parsed.data.steps,
    useCaseId: parsed.data.useCaseId,
  };

  return { data: sanitizedData };
};
