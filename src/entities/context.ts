/**
 * @file context.ts
 * @description Contains the context interface for the application state.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies project.ts
 */

import type { BusinessRule } from './businessRule.js';
import type { Project } from './project.js';
import type { UseCase } from './useCase.js';
import type { Actor } from './actor.js';

export type Variables = {
  projectId: number;
  userId: number;
  actorId: number;
  businessRuleId: number;
  useCaseId: number;
  project: Project;
  actor: Actor;
  businessRule: BusinessRule;
  useCase: UseCase;
};
