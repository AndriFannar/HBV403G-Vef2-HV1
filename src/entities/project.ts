/**
 * @file project.ts
 * @description Schema for projects.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies zod, slug.js, useCase.js, actor.js, businessRule.js, projectSequence.js
 */

import { ProjectSequenceSchema } from './projectSequence.js';
import { NewBusinessRuleSchema } from './businessRule.js';
import { NewUseCaseSchema } from './useCase.js';
import { NewActorSchema } from './actor.js';
import { SlugSchema } from './slug.js';
import { z } from 'zod';

/**
 * A schema for validating a new project.
 */
export const NewProjectSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().optional().nullable(),
  ownerId: z.number(),
});

/**
 * A schema for validating created project.
 */
export const ProjectSchema = NewProjectSchema.extend({
  id: z.number(),
  slug: SlugSchema,
  useCases: z.array(NewUseCaseSchema).optional(),
  actors: z.array(NewActorSchema).optional(),
  businessRules: z.array(NewBusinessRuleSchema).optional(),
  projectSequences: z.array(ProjectSequenceSchema),
});

export type NewProject = z.infer<typeof NewProjectSchema>;
export type Project = z.infer<typeof ProjectSchema>;
