/**
 * @file actor.db.ts
 * @description Contains the database functions for the actor endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 26, 2025
 * @dependencies @prisma/client, actor.js
 */

import type { BaseActor, NewActor } from '../entities/actor.js';
import { PrismaClient } from '@prisma/client';

const DEF_NUM_ACTORS = 10;

export const prisma = new PrismaClient();

/**
 * Gets all actors.
 * @param limit - The maximum number of actors to return at a time.
 * @param offset - The number of actors to skip.
 * @returns - All actors between the limit and offset, if provided. Otherwise, gets 10 actors.
 *            If there are no actors, returns an empty array.
 */
export async function getAllActors(
  limit: number = DEF_NUM_ACTORS,
  offset: number = 0
): Promise<Array<BaseActor>> {
  const actors = await prisma.actor.findMany({
    take: limit,
    skip: offset,
  });
  return actors ?? [];
}

/**
 * Gets actors by a project ID.
 * @param projectId - The ID of the project to get the actors for.
 * @returns - The actors for the project ID, if they exist. Otherwise, returns an empty array.
 */
export async function getActorsByProjectId(
  projectId: number,
  limit: number = DEF_NUM_ACTORS,
  offset: number = 0
): Promise<Array<BaseActor>> {
  const actors = await prisma.actor.findMany({
    take: limit,
    skip: offset,
    where: {
      projectId: projectId,
    },
  });
  return actors ?? [];
}

/**
 * Gets actors by a useCase ID.
 * @param useCaseId - The ID of the useCase to get the actors for.
 * @returns - The actors for the useCase ID, if they exist. Otherwise, returns an empty array.
 */
export async function getActorsByUseCaseId(
  useCaseId: number,
  limit: number = DEF_NUM_ACTORS,
  offset: number = 0
): Promise<Array<BaseActor>> {
  const actors = await prisma.actor.findMany({
    take: limit,
    skip: offset,
    where: {
      OR: [
        {
          useCasesPrimary: {
            some: {
              id: useCaseId,
            },
          },
          useCasesSecondary: {
            some: {
              id: useCaseId,
            },
          },
        },
      ],
    },
  });
  return actors ?? [];
}

/**
 * Gets an actor by ID.
 * @param id - The ID of the actor to fetch.
 * @returns - The actor corresponding to given ID, if it exists. Otherwise, returns null.
 */
export async function getActorById(id: number): Promise<BaseActor | null> {
  const actor = await prisma.actor.findFirst({
    where: {
      id: id,
    },
  });
  return actor ?? null;
}

/**
 * Creates a new actor.
 * @param actor - The new actor to create.
 * @returns - The created actor.
 */
export async function createActor(actor: NewActor): Promise<BaseActor> {
  const createdActor = await prisma.actor.create({
    data: {
      name: actor.name,
      description: actor.description,
      projectId: actor.projectId,
    },
  });

  return createdActor;
}

/**
 * Updates an actor by ID.
 * @param actor - The new actor data.
 * @returns - The updated actor, if it exists. Otherwise, returns null.
 */
export async function updateActor(actor: BaseActor): Promise<BaseActor | null> {
  const updatedActor = await prisma.actor.update({
    where: { id: actor.id },
    data: {
      name: actor.name,
      description: actor.description,
    },
  });

  return updatedActor;
}

/**
 * Deletes an actor by ID.
 * @param id - The ID of the actor to delete.
 */
export async function deleteActor(id: number) {
  await prisma.actor.delete({
    where: { id: id },
  });
}
