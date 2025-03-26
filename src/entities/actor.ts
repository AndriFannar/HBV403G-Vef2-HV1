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
 * A schema for validating a base actor.
 */
export const BaseActorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  projectId: z.number().positive('Project ID must be a positive number'),
});

/**
 * A schema for validating created actor.
 */
export const ActorSchema = BaseActorSchema.extend({
  id: z.number().positive('ID must be a positive number'),
  useCasesPrimary: z.array(UseCaseSchema).optional().default([]),
  useCasesSecondary: z.array(UseCaseSchema).optional().default([]),
});

export type BaseActor = z.infer<typeof BaseActorSchema>;
export type Actor = z.infer<typeof ActorSchema>;
