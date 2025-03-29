/**
 * @file projectValidator.ts
 * @description Validates and sanitizes a project.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, sanitizeString, @prisma/client, project.js
 */

import { BaseProjectSchema, NewProjectSchema } from '../../entities/project.js';
import { Validator } from '../../entities/validator.js';
import { sanitizeString } from './sanitizeString.js';
import { z } from 'zod';

type ValidateNewProject = z.infer<
  ReturnType<typeof Validator<typeof NewProjectSchema>>
>;

type ValidateBaseProject = z.infer<
  ReturnType<typeof Validator<typeof BaseProjectSchema>>
>;

/**
 * Validates and sanitizes a new project.
 * @param data - The project data to validate and sanitize.
 * @returns An object with either the sanitized data or an error.
 */
export const validateAndSanitizeNewProject = async (
  data: unknown
): Promise<ValidateNewProject> => {
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

/**
 * Validates and sanitizes a base project.
 * @param data - The base project data to validate and sanitize.
 * @returns - The validated and sanitized project or an error.
 */
export const validateAndSanitizeBaseProject = async (
  data: unknown
): Promise<ValidateBaseProject> => {
  const parsed = await BaseProjectSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = await validateAndSanitizeNewProject(parsed.data);

  if (!sanitizedData.data) {
    return { error: sanitizedData.error };
  }

  return {
    data: {
      ...sanitizedData.data,
      id: parsed.data.id,
      slug: parsed.data.slug ? sanitizeString(parsed.data.slug) : '',
    },
  };
};
