/**
 * @file reference.ts
 * @description A schema for validating references.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies zod
 */

import { ReferenceType } from '@prisma/client';
import { z } from 'zod';

/**
 * A schema for validating new references.
 */
export const BaseReferenceSchema = z.object({
  refType: z.nativeEnum(ReferenceType),
  refId: z.number(),
  location: z.number(),
  stepId: z.number(),
});

/**
 * A schema for validating references.
 */
export const ReferenceSchema = BaseReferenceSchema.extend({
  id: z.number(),
});

export type BaseReference = z.infer<typeof BaseReferenceSchema>;
export type Reference = z.infer<typeof ReferenceSchema>;
