/**
 * @file reference.ts
 * @description A schema for validating references.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies zod, @prisma/client
 */

import { ReferenceType } from '@prisma/client';
import { z } from 'zod';

/**
 * A schema for validating new references.
 */
export const NewReferenceSchema = z.object({
  refType: z.nativeEnum(ReferenceType),
  refId: z.number().positive('Reference ID must be positive'),
  location: z.number().nonnegative('Location must be zero or positive'),
  stepId: z.number().positive('Step ID must be positive'),
});

/**
 * A schema for validating references.
 */
export const ReferenceSchema = NewReferenceSchema.extend({
  id: z.number().positive('ID must be a positive number'),
});

export type NewReference = z.infer<typeof NewReferenceSchema>;
export type Reference = z.infer<typeof ReferenceSchema>;
