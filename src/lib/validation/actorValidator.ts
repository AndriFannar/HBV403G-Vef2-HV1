/**
 * @file actorValidator.ts
 * @description Validates and sanitizes an actor.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies validator.ts, zod, sanitizeString.js, actor.js
 */

import { BaseActorSchema, NewActorSchema } from '../../entities/actor.js';
import { Validator } from '../../entities/validator.js';
import { sanitizeString } from './sanitizeString.js';
import { z } from 'zod';

type ValidateNewActor = z.infer<
  ReturnType<typeof Validator<typeof NewActorSchema>>
>;

type ValidateBaseActor = z.infer<
  ReturnType<typeof Validator<typeof BaseActorSchema>>
>;

/**
 * Validates and sanitizes a new actor.
 * @param data - The new actor data to validate and sanitize.
 * @returns - The validated and sanitized actor or an error.
 */
export const validateAndSanitizeNewActor = async (
  data: unknown
): Promise<ValidateNewActor> => {
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

/**
 * Validates and sanitizes a base actor.
 * @param data - The base actor data to validate and sanitize.
 * @returns - The validated and sanitized actor or an error.
 */
export const validateAndSanitizeBaseActor = async (
  data: unknown
): Promise<ValidateBaseActor> => {
  const parsed = await BaseActorSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = await validateAndSanitizeNewActor(parsed.data);

  if (!sanitizedData.data) {
    return { error: sanitizedData.error };
  }

  return {
    data: {
      ...sanitizedData.data,
      id: parsed.data.id,
    },
  };
};
