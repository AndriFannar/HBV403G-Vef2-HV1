/**
 * @file actor.ts
 * @description Schema for actors in a use case.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, useCase.ts
 */

import { UseCaseSchema } from './useCase.js';
import { z } from 'zod';

/**
 * A schema for validating a new actor.
 */
export const NewActorSchema = z.object({
  id: z.number().optional().nullable(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  projectId: z.number().positive('Project ID must be a positive number'),
});

/**
 * A schema for validating a base actor.
 */
export const BaseActorSchema = NewActorSchema.extend({
  id: z.number().positive('ID must be a positive number'),
});

/**
 * A schema for validating created actor.
 */
export const ActorSchema = BaseActorSchema.extend({
  useCasesPrimary: z
    .array(z.lazy(() => UseCaseSchema))
    .optional()
    .default([]),
  useCasesSecondary: z
    .array(z.lazy(() => UseCaseSchema))
    .optional()
    .default([]),
});

export type NewActor = z.infer<typeof NewActorSchema>;
export type BaseActor = z.infer<typeof BaseActorSchema>;
export type Actor = z.infer<typeof ActorSchema>;
