/**
 * @file condition.ts
 * @description Schema for conditions in a use case.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, ./referencible.js, @prisma/client
 */

import { Referencible } from './referencible.js';
import { conditionType } from '@prisma/client';
import { z } from 'zod';

/**
 * A schema for validating a base condition.
 */
export const BaseConditionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  conditionType: z.nativeEnum(conditionType),
  useCaseId: z.number().positive('Use case ID must be positive'),
});

/**
 * A schema for validating created condition.
 */
export const ConditionSchema = BaseConditionSchema.extend({
  id: z.number().positive('ID must be a positive number'),
}).merge(Referencible);

export type BaseCondition = z.infer<typeof BaseConditionSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
