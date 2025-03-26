/**
 * @file flowValidator.ts
 * @description Validates and sanitizes a flow.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, sanitizeString, @prisma/client, flow.js
 */

import { Validator } from '../../entities/validator.js';
import { NewFlowSchema } from '../../entities/flow.js';
import { sanitizeString } from './sanitizeString.js';
import { z } from 'zod';

type ValidateFlow = z.infer<ReturnType<typeof Validator<typeof NewFlowSchema>>>;

/**
 * Validates and sanitizes a new flow.
 * @param data - The flow data to validate and sanitize.
 * @returns An object with either the sanitized data or an error.
 */
export const validateAndSanitizeNewFlow = async (
  data: unknown
): Promise<ValidateFlow> => {
  const parsed = await NewFlowSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = {
    name: sanitizeString(parsed.data.name),
    flowType: parsed.data.flowType,
    steps: parsed.data.steps,
    useCaseId: parsed.data.useCaseId,
    forFlowId: parsed.data.forFlowId,
  };

  return { data: sanitizedData };
};
