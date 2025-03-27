/**
 * @file projectValidator.ts
 * @description Validates and sanitizes a project.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, sanitizeString, @prisma/client, project.js
 */

import { NewProjectSchema } from '../../entities/project.js';
import { Validator } from '../../entities/validator.js';
import { sanitizeString } from './sanitizeString.js';
import { z } from 'zod';

type ValidateProject = z.infer<
  ReturnType<typeof Validator<typeof NewProjectSchema>>
>;

/**
 * Validates and sanitizes a base (new) project.
 * @param data - The project data to validate and sanitize.
 * @returns An object with either the sanitized data or an error.
 */
export const validateAndSanitizeBaseProject = async (
  data: unknown
): Promise<ValidateProject> => {
  const parsed = await NewProjectSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = {
    name: sanitizeString(parsed.data.name),
    description: parsed.data.description
      ? sanitizeString(parsed.data.description)
      : '',
    ownerId: parsed.data.ownerId,
  };

  return { data: sanitizedData };
};
