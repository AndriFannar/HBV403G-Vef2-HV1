/**
 * @file conditions.db.ts
 * @description Contains the database functions for the conditions endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 26, 2025
 * @dependencies @prisma/client, condition.js
 */

import type { Condition, NewCondition } from '../entities/condition.js';
import {
  Prisma,
  EntityType,
  PrismaClient,
  ConditionType,
} from '@prisma/client';

const defaultNumConditions = 10;

export const prisma = new PrismaClient();

/**
 * Generates a public ID for a new condition.
 * @param tx - The Prisma transaction client.
 * @param condition - The new condition to generate a public ID for.
 * @returns - The generated public ID for the condition.
 */
async function generateConditionPublicId(
  tx: Prisma.TransactionClient,
  condition: NewCondition
): Promise<string> {
  const conditionType =
    condition.conditionType === ConditionType.PRECONDITION
      ? EntityType.PRECONDITION
      : EntityType.POSTCONDITION;

  const useCaseSequence = await tx.useCaseSequence.findUnique({
    where: {
      // eslint-disable-next-line camelcase
      useCaseId_entityType: {
        useCaseId: condition.useCaseId,
        entityType: conditionType,
      },
    },
  });

  if (!useCaseSequence) {
    throw new Error('UseCaseSequence not found');
  }

  const newCount = useCaseSequence.count + 1;
  await tx.useCaseSequence.update({
    where: { id: useCaseSequence.id },
    data: { count: newCount },
  });

  if (condition.conditionType === ConditionType.PRECONDITION) {
    return `PRE-${newCount}`;
  } else {
    return `POST-${newCount}`;
  }
}

/**
 * Gets all conditions.
 * @param conditionType - The type of condition to get. If not specified, gets all conditions.
 * @param limit - The maximum number of conditions to return at a time.
 * @param offset - The number of conditions to skip.
 * @returns - All conditions between the limit and offset, if provided. Otherwise, gets 10 conditions.
 *            If there are no conditions, returns an empty array.
 */
export async function getAllConditions(
  conditionType?: ConditionType,
  limit: number = defaultNumConditions,
  offset: number = 0
): Promise<Array<Condition>> {
  const conditions = await prisma.condition.findMany({
    where: {
      conditionType: conditionType,
    },
    take: limit,
    skip: offset,
  });
  return conditions ?? [];
}

/**
 * Gets conditions by a useCase ID.
 * @param useCaseId - The ID of the useCase to get the conditions for.
 * @param conditionType - The type of condition to get. If not specified, gets all conditions.
 * @returns - The conditions for the useCase ID, if they exists. Otherwise, returns an empty array.
 */
export async function getConditionsByUseCaseId(
  useCaseId: number,
  conditionType?: ConditionType
): Promise<Array<Condition>> {
  const conditions = await prisma.condition.findMany({
    where: {
      useCaseId: useCaseId,
      conditionType: conditionType,
    },
  });
  return conditions ?? [];
}

/**
 * Gets a condition by ID.
 * @param id - The ID of the condition to fetch.
 * @returns - The condition corresponding to given ID, if it exists. Otherwise, returns null.
 */
export async function getConditionById(id: number): Promise<Condition | null> {
  const condition = await prisma.condition.findFirst({
    where: {
      id: id,
    },
  });
  return condition ?? null;
}

/**
 * Creates a new condition.
 * @param condition - The new condition to create.
 * @returns - The created condition.
 */
export async function createCondition(
  condition: NewCondition
): Promise<Condition> {
  return await prisma.$transaction(async tx => {
    const publicId = await generateConditionPublicId(tx, condition);

    const createdCondition = await tx.condition.create({
      data: {
        description: condition.description,
        conditionType: condition.conditionType,
        publicId: publicId,
        useCaseId: condition.useCaseId,
      },
    });

    return createdCondition;
  });
}

/**
 * Updates a condition by ID.
 * @param condition - The new condition data.
 * @returns - The updated condition, if it exists. Otherwise, returns null.
 */
export async function updateCondition(
  condition: Condition
): Promise<Condition | null> {
  const updatedCondition = await prisma.condition.update({
    where: { id: condition.id },
    data: {
      description: condition.description,
    },
  });

  return updatedCondition;
}

/**
 * Deletes a condition by ID.
 * @param id - The ID of the condition to delete.
 */
export async function deleteCondition(id: number) {
  await prisma.condition.delete({
    where: { id: id },
  });
}
