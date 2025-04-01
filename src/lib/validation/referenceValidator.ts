/**
 * @file referenceValidator.ts
 * @description Validates and sanitizes a reference.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, @prisma/client, reference.js
 */

import { NewReferenceSchema } from '../../entities/reference.js';
import { Validator } from '../../entities/validator.js';
import { z } from 'zod';

type ValidateReference = z.infer<
  ReturnType<typeof Validator<typeof NewReferenceSchema>>
>;

/**
 * Validates and sanitizes a base (new) reference.
 * @param data - The reference data to validate and sanitize.
 * @returns An object with either the sanitized data or an error.
 */
export const validateAndSanitizeBaseReference = async (
  data: unknown
): Promise<ValidateReference> => {
  const parsed = await NewReferenceSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = {
    refType: parsed.data.refType,
    refId: parsed.data.refId,
    location: parsed.data.location,
    stepId: parsed.data.stepId,
  };

  return { data: sanitizedData };
};
