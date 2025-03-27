/**
 * @file users.db.ts
 * @description Contains the database functions for the users endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies user.js, @prisma/client
 */

import type { BaseUser, NewUser } from '../entities/user.js';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const DEF_NUM_USERS = 10;

/**
 * Gets all users.
 * @param limit - The maximum number of users to return.
 * @param offset - The number of users to skip.
 * @returns - All users between the limit and offset, if provided. Otherwise, gets defaultNumUsers users.
 *            If there are no users, returns an empty array.
 */
export async function getAllUsers(
  limit: number = DEF_NUM_USERS,
  offset: number = 0
): Promise<Array<BaseUser>> {
  const users = await prisma.user.findMany({
    skip: offset,
    take: limit,
  });
  return users ?? null;
}

/**
 * Gets a user by username.
 * @param username - The username of the user to get.
 * @returns - The user with the given username or null if not found.
 */
export async function getUserByUsername(
  username: string
): Promise<BaseUser | null> {
  const user = await prisma.user.findFirst({
    where: {
      username: username,
    },
  });
  return user ?? null;
}

/**
 * Gets a user by ID.
 * @param id - The ID of the user to get.
 * @returns - The user with the given ID or null if not found.
 */
export async function getUserById(id: number): Promise<BaseUser | null> {
  const user = await prisma.user.findFirst({
    where: {
      id: id,
    },
  });
  return user ?? null;
}

/**
 * Creates a new user.
 * @param user - The base user to create.
 * @returns - The created user.
 */
export async function createUser(user: NewUser): Promise<BaseUser> {
  const newUser = await prisma.user.create({
    data: {
      username: user.username,
      password: user.password,
    },
  });
  return newUser;
}

/**
 * Updates a user by ID.
 * @param user - The new user data.
 * @returns - The updated user, if it exists. Otherwise, returns null.
 */
export async function updateUser(user: BaseUser): Promise<BaseUser> {
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      username: user.username,
      password: user.password,
      role: user.role,
    },
  });
  return updatedUser;
}

/**
 * Deletes an user by ID.
 * @param id - The ID of the user to delete.
 */
export async function deleteUser(id: number) {
  await prisma.user.delete({
    where: { id: id },
  });
}
