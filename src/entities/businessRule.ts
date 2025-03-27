/**
 * @file businessRule.ts
 * @description Schema for business rules in a use case.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, @prisma/client, ./referencible.js, ./useCase.js
 */

import { Mutability, RuleType } from '@prisma/client';
import { Referencible } from './referencible.js';
import { NewUseCaseSchema } from './useCase.js';
import { z } from 'zod';

/**
 * A schema for validating a new business rule.
 */
export const NewBusinessRuleSchema = z.object({
  id: z.number().optional().nullable(),
  ruleDef: z.string().min(1, 'Rule definition is required'),
  type: z.nativeEnum(RuleType),
  mutability: z.nativeEnum(Mutability),
  source: z.string().min(1, 'Source is required'),
  projectId: z.number().positive('Project ID must be a positive number'),
});

/**
 * A schema for validating a base business rule.
 */
export const BaseBusinessRuleSchema = NewBusinessRuleSchema.extend({
  id: z.number().positive('ID must be a positive number'),
}).merge(Referencible);

/**
 * A schema for validating created business rule.
 */
export const BusinessRuleSchema = BaseBusinessRuleSchema.extend({
  useCases: z.array(NewUseCaseSchema).optional().default([]),
});

export type NewBusinessRule = z.infer<typeof NewBusinessRuleSchema>;
export type BaseBusinessRule = z.infer<typeof BaseBusinessRuleSchema>;
export type BusinessRule = z.infer<typeof BusinessRuleSchema>;
