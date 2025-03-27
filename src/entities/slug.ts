/**
 * @file slug.ts
 * @description A schema for validating slugs.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies zod
 */

import { z } from 'zod';

const maxSlugLength = 550;
const minSlugLength = 3;

/**
 * A schema for validating slugs.
 */
export const SlugSchema = z
  .string()
  .min(minSlugLength, `Slug must be at least ${minSlugLength} letters`)
  .max(maxSlugLength, `Slug must be at most ${maxSlugLength} letters`)
  .regex(
    /^[a-z0-9-]+$/,
    `Slug must only contain lowercase letters, numbers, and hyphens`
  );
