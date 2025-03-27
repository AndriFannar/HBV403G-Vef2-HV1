/**
 * @file projectSequence.ts
 * @description Schema for projectSequence which keeps track of counters for other entities linked to a Project.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, @prisma/client
 */

import { ProjectCounterType } from '@prisma/client';
import { z } from 'zod';

/**
 * A schema for validating a projectSequence.
 */
export const ProjectSequenceSchema = z.object({
  id: z.number().positive('ID must be a positive number'),
  projectId: z.number().positive('Use case ID must be a positive number'),
  entityType: z.nativeEnum(ProjectCounterType),
  count: z.number().default(0),
});

export type ProjectSequence = z.infer<typeof ProjectSequenceSchema>;
