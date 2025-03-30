/**
 * @file condition.ts
 * @description Schema for conditions in a use case.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, ./referencible.js, @prisma/client
 */

import { Referencible } from './referencible.js';
import { ConditionType } from '@prisma/client';
import { z } from 'zod';

/**
 * A schema for validating a new condition.
 */
export const NewConditionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  conditionType: z.nativeEnum(ConditionType),
  useCaseId: z.number().positive('Use case ID must be positive').optional(),
});

/**
 * A schema for validating created condition.
 */
export const ConditionSchema = NewConditionSchema.extend({
  id: z.number().positive('ID must be a positive number'),
  useCaseId: z.number().positive('Use case ID must be positive'),
}).merge(Referencible);

export type NewCondition = z.infer<typeof NewConditionSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
