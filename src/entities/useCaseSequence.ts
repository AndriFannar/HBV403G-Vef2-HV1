/**
 * @file useCaseSequence.ts
 * @description Schema for useCaseSequence which keeps track of counters for other entities linked to a UseCase.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, @prisma/client
 */

import { EntityType } from '@prisma/client';
import { z } from 'zod';

/**
 * A schema for validating a useCaseSequence.
 */
export const UseCaseSequenceSchema = z.object({
  id: z.number().positive('ID must be a positive number'),
  useCaseId: z.number().positive('Use case ID must be a positive number'),
  entityType: z.nativeEnum(EntityType),
  count: z.number().default(0),
});

export type UseCaseSequence = z.infer<typeof UseCaseSequenceSchema>;
