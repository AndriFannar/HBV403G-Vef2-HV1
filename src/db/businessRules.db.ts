/**
 * @file businessRules.db.ts
 * @description Contains the database functions for the businessRules endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 26, 2025
 * @dependencies @prisma/client, businessRules.js, publicIdGenerators.js
 */

import { generateBusinessRulePublicId } from './publicIdGenerators.js';
import { PrismaClient } from '@prisma/client';
import type {
  NewBusinessRule,
  BaseBusinessRule,
} from '../entities/businessRule.js';

const DEF_NUM_BUSINESSRULES = 10;

export const prisma = new PrismaClient();

/**
 * Gets all businessRules.
 * @param limit - The maximum number of businessRules to return at a time.
 * @param offset - The number of businessRules to skip.
 * @returns - All businessRules between the limit and offset, if provided. Otherwise, gets 10 businessRules.
 *            If there are no businessRules, returns an empty array.
 */
export async function getAllBusinessRules(
  limit: number = DEF_NUM_BUSINESSRULES,
  offset: number = 0
): Promise<Array<BaseBusinessRule>> {
  const businessRules = await prisma.businessRule.findMany({
    take: limit,
    skip: offset,
  });
  return businessRules ?? [];
}

/**
 * Gets businessRules by a project ID.
 * @param projectId - The ID of the project to get the businessRules for.
 * @returns - The businessRules for the project ID, if they exist. Otherwise, returns an empty array.
 */
export async function getBusinessRulesByProjectId(
  projectId: number,
  limit: number = DEF_NUM_BUSINESSRULES,
  offset: number = 0
): Promise<Array<BaseBusinessRule>> {
  const businessRules = await prisma.businessRule.findMany({
    take: limit,
    skip: offset,
    where: {
      projectId: projectId,
    },
  });
  return businessRules ?? [];
}

/**
 * Gets businessRules by a useCase ID.
 * @param useCaseId - The ID of the useCase to get the businessRules for.
 * @returns - The businessRules for the useCase ID, if they exist. Otherwise, returns an empty array.
 */
export async function getBusinessRulesByUseCaseId(
  useCaseId: number,
  limit: number = DEF_NUM_BUSINESSRULES,
  offset: number = 0
): Promise<Array<BaseBusinessRule>> {
  const businessRules = await prisma.businessRule.findMany({
    take: limit,
    skip: offset,
    where: {
      useCases: {
        some: {
          id: useCaseId,
        },
      },
    },
  });
  return businessRules ?? [];
}

/**
 * Gets a businessRule by ID.
 * @param id - The ID of the businessRule to fetch.
 * @returns - The businessRule corresponding to given ID, if it exists. Otherwise, returns null.
 */
export async function getBusinessRuleById(
  id: number
): Promise<BaseBusinessRule | null> {
  const businessRule = await prisma.businessRule.findFirst({
    where: {
      id: id,
    },
  });
  return businessRule ?? null;
}

/**
 * Creates a new businessRule.
 * @param businessRule - The new businessRule to create.
 * @returns - The created businessRule.
 */
export async function createBusinessRule(
  businessRule: NewBusinessRule
): Promise<BaseBusinessRule> {
  return await prisma.$transaction(async tx => {
    const publicId = await generateBusinessRulePublicId(tx, businessRule);

    const createdBusinessRule = await tx.businessRule.create({
      data: {
        ruleDef: businessRule.ruleDef,
        type: businessRule.type,
        mutability: businessRule.mutability,
        source: businessRule.source,
        projectId: businessRule.projectId,
        publicId: publicId,
      },
    });

    return createdBusinessRule;
  });
}

/**
 * Updates a businessRule by ID.
 * @param condition - The new businessRule data.
 * @returns - The updated businessRule, if it exists. Otherwise, returns null.
 */
export async function updateBusinessRule(
  businessRule: BaseBusinessRule
): Promise<BaseBusinessRule | null> {
  const updatedBusinessRule = await prisma.businessRule.update({
    where: { id: businessRule.id },
    data: {
      ruleDef: businessRule.ruleDef,
      type: businessRule.type,
      mutability: businessRule.mutability,
    },
  });

  return updatedBusinessRule;
}

/**
 * Deletes a businessRule by ID.
 * @param id - The ID of the businessRule to delete.
 */
export async function deleteBusinessRule(id: number) {
  await prisma.businessRule.delete({
    where: { id: id },
  });
}
