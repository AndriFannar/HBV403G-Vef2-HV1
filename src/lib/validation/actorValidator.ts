/**
 * @file actorValidator.ts
 * @description Validates and sanitizes an actor.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies validator.ts, zod, sanitizeString.js, actor.js
 */

import { NewActorSchema } from '../../entities/actor.js';
import { Validator } from '../../entities/validator.js';
import { sanitizeString } from './sanitizeString.js';
import { z } from 'zod';

type ValidateActor = z.infer<
  ReturnType<typeof Validator<typeof NewActorSchema>>
>;

/**
 * Validates and sanitizes a base (new) actor.
 * @param data - The base actor data to validate and sanitize.
 * @returns - The validated and sanitized actor or an error.
 */
export const validateAndSanitizeBaseActor = async (
  data: unknown
): Promise<ValidateActor> => {
  const parsed = await NewActorSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = {
    name: sanitizeString(parsed.data.name),
    description: parsed.data.description
      ? sanitizeString(parsed.data.description)
      : '',
    projectId: parsed.data.projectId,
  };

  return { data: sanitizedData };
};
