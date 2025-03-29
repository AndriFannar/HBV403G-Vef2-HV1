/**
 * @file context.ts
 * @description Contains the context interface for the application state.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies project.ts
 */

import type { BusinessRule } from '@prisma/client';
import type { Project } from './project.js';
import type { Actor } from './actor.js';

export type Variables = {
  projectId: number;
  userId: number;
  actorId: number;
  businessRuleId: number;
  project: Project;
  actor: Actor;
  businessRule: BusinessRule;
};
