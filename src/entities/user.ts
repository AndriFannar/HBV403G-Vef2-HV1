/**
 * @file user.ts
 * @description Contains the schema for a base (new) user and an existing user.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies zod, @prisma/client
 */

import { Role } from '@prisma/client';
import { z } from 'zod';

const minUsernameLength = 2;
const maxUsernameLength = 32;
const minPasswordLength = 6;
const maxPasswordLength = 64;

/**
 * A schema for validating a base (new) user.
 */
export const BaseUserSchema = z.object({
  username: z
    .string()
    .min(
      minUsernameLength,
      `Username must be at least ${minUsernameLength} letters`
    )
    .max(
      maxUsernameLength,
      `Username must be at most ${maxUsernameLength} letters`
    ),
  password: z
    .string()
    .min(
      minPasswordLength,
      `Password must be at least ${minPasswordLength} letters`
    )
    .max(
      maxPasswordLength,
      `Password must be at most ${maxPasswordLength} letters`
    ),
});

/**
 * A schema for validating a user.
 */
export const UserSchema = BaseUserSchema.extend({
  id: z.number().positive('User ID must be positive'),
  role: z.nativeEnum(Role),
  projects: z
    .array(z.number().positive('Project ID must be positive'))
    .optional()
    .default([]),
  useCases: z
    .array(z.number().positive('Use case ID must be positive'))
    .optional()
    .default([]),
});

export type BaseUser = z.infer<typeof BaseUserSchema>;
export type User = z.infer<typeof UserSchema>;
