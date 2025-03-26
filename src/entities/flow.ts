/**
 * @file flow.ts
 * @description Schema for flows in a use case.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, @prisma/client, ./referencible, ./step.js
 */

import { Referencible } from './referencible.js';
import { NewStepSchema } from './step.js';
import { FlowType } from '@prisma/client';
import { z } from 'zod';

export const BaseFlowSchema = z.object({
  name: z.string().min(1, 'Flow name is required'),
  flowType: z.nativeEnum(FlowType),
  useCaseId: z.number().positive('Use case ID must be positive'),
  forFlowId: z.number().optional().nullable(),
});

/**
 * A schema for validating a base flow.
 */
export const NewFlowSchema = BaseFlowSchema.extend({
  steps: z.array(NewStepSchema).min(1, 'A flow must have at least one step'),
});

/**
 * A schema for validating created flow.
 */
export const FlowSchema = NewFlowSchema.extend({
  id: z.number().positive('ID must be a positive number'),
  stepCount: z.number().default(0),
}).merge(Referencible);

export type BaseFlow = z.infer<typeof BaseFlowSchema>;
export type NewFlow = z.infer<typeof NewFlowSchema>;
export type Flow = z.infer<typeof FlowSchema>;
