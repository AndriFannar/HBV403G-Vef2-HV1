/**
 * @file useCase.ts
 * @description Schema for use cases in a project.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, slug.js, @prisma/client, businessRule.js, condition.js, actor.js, flow.js
 */

import { BaseBusinessRuleSchema } from './businessRule.js';
import { BaseConditionSchema } from './condition.js';
import { BaseActorSchema } from './actor.js';
import { BaseFlowSchema } from './flow.js';
import { Priority } from '@prisma/client';
import { SlugSchema } from './slug.js';
import { z } from 'zod';

/**
 * A schema for validating a base use case.
 */
export const BaseUseCaseSchema = z.object({
  projectId: z.number().positive('Project ID must be positive'),
  name: z.string().min(1, 'Use case name is required'),
  creatorId: z.number().positive('Creator ID must be positive'),
  primaryActorId: z.number().positive('Primary actor ID must be positive'),
  secondaryActors: z.array(BaseActorSchema).optional().default([]),
  description: z.string().min(1, 'Description is required'),
  trigger: z.string().min(1, 'Trigger is required'),
  conditions: z.array(BaseConditionSchema).optional().default([]),
  flows: z.array(BaseFlowSchema).min(1, 'At least one Flow is required'),
  priority: z.nativeEnum(Priority),
  freqUse: z.string().optional(),
  businessRules: z.array(BaseBusinessRuleSchema).optional().default([]),
  otherInfo: z.string().optional(),
  assumptions: z.string().optional(),
});

/**
 * A schema for validating created use case.
 */
export const UseCaseSchema = BaseUseCaseSchema.extend({
  id: z.number().positive('ID must be a positive number'),
  slug: SlugSchema,
  dateCreated: z.date(),
  dateModified: z.date(),
});

export type BaseUseCase = z.infer<typeof BaseUseCaseSchema>;
export type UseCase = z.infer<typeof UseCaseSchema>;
