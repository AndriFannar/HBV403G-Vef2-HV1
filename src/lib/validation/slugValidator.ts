/**
 * @file slugValidator.ts
 * @description Validates and sanitizes a slug.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies validator.ts, slug.ts, zod, xss
 */

import { Validator } from '../../entities/validator.js';
import { SlugSchema } from '../../entities/slug.js';
import { z } from 'zod';
import xss from 'xss';

type ValidateSlugType = z.infer<
  ReturnType<typeof Validator<typeof SlugSchema>>
>;

/**
 * Validates and sanitizes a slug.
 * @param data - The slug to validate and sanitize.
 * @returns - The validated and sanitized slug or an error.
 */
export const validateAndSanitizeSlug = async (
  data: unknown
): Promise<ValidateSlugType> => {
  const parsed = await SlugSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = xss(parsed.data.trim());

  return { data: sanitizedData };
};
