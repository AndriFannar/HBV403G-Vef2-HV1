/**
 * @file referencible.ts
 * @description "Interface" for referencible entities.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 21, 2025
 * @dependencies zod
 */

import { z } from 'zod';

/**
 * A schema for referencible entities.
 */
export const Referencible = z.object({
  publicId: z.string(),
  //.regex(/^[A-Z]+-\d+$/, 'Public ID must be in the format PREFIX-Number'),
});
