/**
 * @file user.ts
 * @description Contains the schema for a base (new) user and an existing user.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies zod, @prisma/client, ./useCase.js, ./project.js
 */

import { BaseUseCaseSchema } from './useCase.js';
import { BaseProjectSchema } from './project.js';
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
  projects: z.array(BaseProjectSchema).optional().default([]),
  useCases: z.array(BaseUseCaseSchema).optional().default([]),
});

export type BaseUser = z.infer<typeof BaseUserSchema>;
export type User = z.infer<typeof UserSchema>;
