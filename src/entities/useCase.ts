/**
 * @file useCase.ts
 * @description Schema for use cases in a project.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, slug.js, @prisma/client, businessRule.js, condition.js, actor.js, flow.js, referencible.js, useCaseSequence.js
 */

import { UseCaseSequenceSchema } from './useCaseSequence.js';
import { NewBusinessRuleSchema } from './businessRule.js';
import { NewConditionSchema } from './condition.js';
import { Referencible } from './referencible.js';
import { NewActorSchema } from './actor.js';
import { NewFlowSchema } from './flow.js';
import { Priority } from '@prisma/client';
import { SlugSchema } from './slug.js';
import { z } from 'zod';

/**
 * A schema for validating a new UseCase.
 */
export const NewUseCaseSchema = z.object({
  id: z.number().positive('ID must be a positive number').optional(),
  projectId: z.number().positive('Project ID must be positive'),
  name: z.string().min(1, 'Use case name is required'),
  creatorId: z.number().positive('Creator ID must be positive').optional(),
  primaryActor: z.lazy(() => NewActorSchema),
  secondaryActors: z
    .array(z.lazy(() => NewActorSchema))
    .optional()
    .default([]),
  description: z.string().min(1, 'Description is required'),
  trigger: z.string().min(1, 'Trigger is required'),
  conditions: z
    .array(NewConditionSchema)
    .min(1, 'At least one postcondition is required'),
  flows: z.array(NewFlowSchema).min(1, 'At least one Normal Flow is required'),
  priority: z.nativeEnum(Priority),
  freqUse: z.string().optional().nullable(),
  businessRules: z
    .array(z.lazy(() => NewBusinessRuleSchema))
    .optional()
    .default([]),
  otherInfo: z.array(z.string()).optional().nullable(),
  assumptions: z.array(z.string()).optional().nullable(),
});

/**
 * A schema for validating created use case.
 */
export const UseCaseSchema = NewUseCaseSchema.extend({
  id: z.number().positive('ID must be a positive number'),
  slug: SlugSchema,
  creatorId: z.number().positive('Creator ID must be positive'),
  dateCreated: z.date(),
  dateModified: z.date(),
  useCaseSequences: z.array(UseCaseSequenceSchema).optional(),
}).merge(Referencible);

/**
 * A schema for validating a base use case.
 */
export const BaseUseCaseSchema = UseCaseSchema.omit({
  conditions: true,
  flows: true,
  businessRules: true,
  useCaseSequences: true,
  primaryActor: true,
  secondaryActors: true,
  otherInfo: true,
  assumptions: true,
});

export type NewUseCase = z.infer<typeof NewUseCaseSchema>;
export type UseCase = z.infer<typeof UseCaseSchema>;
export type BaseUseCase = z.infer<typeof BaseUseCaseSchema>;
