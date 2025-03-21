/**
 * @file users.db.ts
 * @description Contains the database functions for the users endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies user.js, @prisma/client, logger
 */
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
const defaultNumUsers = 10;
/**
 * Gets all users.
 * @param limit - The maximum number of users to return.
 * @param offset - The number of users to skip.
 * @returns - All users between the limit and offset, if provided. Otherwise, gets defaultNumUsers users.
 *            If there are no users, returns an empty array.
 */
export async function getUsers(limit = defaultNumUsers, offset = 0) {
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
export async function getUser(username) {
    const user = await prisma.user.findFirst({
        where: {
            username: username,
        },
    });
    return user ?? null;
}
/**
 * Creates a new user.
 * @param user - The base user to create.
 * @returns - The created user.
 */
export async function createUser(user) {
    const newUser = await prisma.user.create({
        data: {
            username: user.username,
            password: user.password,
        },
    });
    return newUser;
}
