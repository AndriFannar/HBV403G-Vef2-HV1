/**
 * @file context.ts
 * @description Contains the context interface for the application state.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies project.ts
 */

import type { Project } from './project.js';

export type Variables = {
  project: Project;
};
