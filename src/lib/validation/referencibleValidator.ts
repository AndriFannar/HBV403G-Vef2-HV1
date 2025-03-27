/**
 * @file referencibleValidator.ts
 * @description Validates and sanitizes a referencible.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, @prisma/client, referencible.js
 */

import { Referencible } from '../../entities/referencible.js';
import { Validator } from '../../entities/validator.js';
import { sanitizeString } from './sanitizeString.js';
import { z } from 'zod';

type ValidateReferencible = z.infer<
  ReturnType<typeof Validator<typeof Referencible>>
>;

/**
 * Validates and sanitizes a base (new) referencible.
 * @param data - The referencible data to validate and sanitize.
 * @returns An object with either the sanitized data or an error.
 */
export const validateAndSanitizeBaseReferencible = async (
  data: unknown
): Promise<ValidateReferencible> => {
  const parsed = await Referencible.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = {
    publicId: sanitizeString(parsed.data.publicId),
  };

  return { data: sanitizedData };
};
