/**
 * @file flow.ts
 * @description Schema for flows in a use case.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, @prisma/client, ./referencible, ./step.js
 */

import { Referencible } from './referencible.js';
import { FlowType } from '@prisma/client';
import { StepSchema } from './step.js';
import { z } from 'zod';

/**
 * A schema for validating a base flow.
 */
export const BaseFlowSchema = z.object({
  name: z.string().min(1, 'Flow name is required'),
  flowType: z.nativeEnum(FlowType),
  steps: z.array(StepSchema),
  useCaseId: z.number().positive('Use case ID must be positive'),
});

/**
 * A schema for validating created flow.
 */
export const FlowSchema = BaseFlowSchema.extend({
  id: z.number().positive('ID must be a positive number'),
}).merge(Referencible);

export type BaseFlow = z.infer<typeof BaseFlowSchema>;
export type Flow = z.infer<typeof FlowSchema>;
