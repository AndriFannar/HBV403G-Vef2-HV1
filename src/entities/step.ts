/**
 * @file step.ts
 * @description Schema for steps in a Flow.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, ./reference.js, ./referencible.js
 */

import { ReferenceSchema } from './reference.js';
import { Referencible } from './referencible.js';
import { z } from 'zod';

/**
 * A schema for validating a base step.
 */
export const BaseStepSchema = z.object({
  step: z.string().nonempty(),
  flowId: z.number().positive('Flow ID must be positive'),
});

/**
 * A schema for validating a base step.
 */
export const NewStepSchema = BaseStepSchema.extend({
  refs: z.array(ReferenceSchema).optional().default([]),
});

/**
 * A schema for validating created step.
 */
export const StepSchema = NewStepSchema.extend({
  id: z.number().positive('ID must be a positive number'),
}).merge(Referencible);

export type BaseStep = z.infer<typeof BaseStepSchema>;
export type NewStep = z.infer<typeof NewStepSchema>;
export type Step = z.infer<typeof StepSchema>;
