/**
 * @file useCaseValidator.ts
 * @description Validates and sanitizes a useCase.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, sanitizeString, @prisma/client, useCase.js
 */

import { NewUseCaseSchema } from '../../entities/useCase.js';
import { Validator } from '../../entities/validator.js';
import { sanitizeString } from './sanitizeString.js';
import { z } from 'zod';

type ValidateUseCase = z.infer<
  ReturnType<typeof Validator<typeof NewUseCaseSchema>>
>;

/**
 * Validates and sanitizes a base (new) useCase.
 * @param data - The useCase data to validate and sanitize.
 * @returns An object with either the sanitized data or an error.
 */
export const validateAndSanitizeBaseUseCase = async (
  data: unknown
): Promise<ValidateUseCase> => {
  const parsed = await NewUseCaseSchema.safeParseAsync(data);
  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const sanitizedData = {
    projectId: parsed.data.projectId,
    name: sanitizeString(parsed.data.name),
    creatorId: parsed.data.creatorId,
    primaryActorId: parsed.data.primaryActorId,
    secondaryActors: parsed.data.secondaryActors,
    description: sanitizeString(parsed.data.description),
    trigger: sanitizeString(parsed.data.trigger),
    conditions: parsed.data.conditions,
    flows: parsed.data.flows,
    priority: parsed.data.priority,
    freqUse: parsed.data.freqUse ? sanitizeString(parsed.data.freqUse) : '',
    businessRules: parsed.data.businessRules,
    otherInfo: parsed.data.otherInfo
      ? parsed.data.otherInfo.map(info => sanitizeString(info))
      : [],
    assumptions: parsed.data.assumptions
      ? parsed.data.assumptions.map(info => sanitizeString(info))
      : [],
  };

  return { data: sanitizedData };
};
