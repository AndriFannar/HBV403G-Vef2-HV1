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

const minProjectNameLength = 2;
const maxProjectNameLength = 32;

/**
 * A schema for validating a new project.
 */
export const NewProjectSchema = z.object({
  name: z
    .string()
    .min(
      minProjectNameLength,
      `Username must be at least ${minProjectNameLength} letters`
    )
    .max(
      maxProjectNameLength,
      `Username must be at most ${maxProjectNameLength} letters`
    ),
  description: z.string().optional().nullable(),
  ownerId: z.number().positive('Owner ID must be a positive number').optional(),
});

/**
 * A schema for validating a base project.
 */
export const BaseProjectSchema = NewProjectSchema.extend({
  id: z.number().positive('ID must be a positive number'),
  slug: SlugSchema.optional().nullable(),
});

/**
 * A schema for validating created project.
 */
export const ProjectSchema = BaseProjectSchema.extend({
  useCases: z.array(NewUseCaseSchema).optional(),
  actors: z.array(NewActorSchema).optional(),
  businessRules: z.array(NewBusinessRuleSchema).optional(),
  projectSequences: z.array(ProjectSequenceSchema),
});

export type NewProject = z.infer<typeof NewProjectSchema>;
export type BaseProject = z.infer<typeof BaseProjectSchema>;
export type Project = z.infer<typeof ProjectSchema>;
