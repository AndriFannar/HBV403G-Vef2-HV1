/**
 * @file project.ts
 * @description Schema for projects.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, slug.js
 */

import { SlugSchema } from './slug.js';
import { z } from 'zod';

/**
 * A schema for validating a base project.
 */
export const BaseProjectSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
  ownerId: z.number(),
});

/**
 * A schema for validating created project.
 */
export const ProjectSchema = BaseProjectSchema.extend({
  id: z.number(),
  slug: SlugSchema,
  useCases: z.array(z.number()).optional(),
  actors: z.array(z.number()).optional(),
  businessRules: z.array(z.number()).optional(),
});

export type BaseProject = z.infer<typeof BaseProjectSchema>;
export type Project = z.infer<typeof ProjectSchema>;
