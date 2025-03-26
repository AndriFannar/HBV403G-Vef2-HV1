/**
 * @file useCases.db.ts
 * @description Contains the database functions for the useCases endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 26, 2025
 * @dependencies useCase.js, @prisma/client
 */

import type { UseCase, BaseUseCase } from '../entities/useCase.js';
import { PrismaClient } from '@prisma/client';

const defaultNumUseCases = 10;
export const prisma = new PrismaClient();

/**
 * Gets all useCases.
 * @param limit - The maximum number of useCases to return at a time.
 * @param offset - The number of useCases to skip.
 * @returns - All useCases between the limit and offset, if provided. Otherwise, gets 10 useCases.
 *            If there are no useCases, returns an empty array.
 */
export async function getCategories(
  limit: number = defaultNumUseCases,
  offset: number = 0
): Promise<Array<UseCase>> {
  const useCases = await prisma.useCase.findMany({
    skip: offset,
    take: limit,
  });
  return useCases ?? null;
}

/**
 * Gets a category by slug.
 * @param slug - The slug of the category to get.
 * @returns - The category with the given slug or null if not found.
 */
export async function getCategory(slug: string): Promise<Category | null> {
  const category = await prisma.categories.findFirst({
    where: {
      slug: slug,
    },
    include: {
      questions: {
        include: {
          answers: true,
        },
      },
    },
  });
  return category ?? null;
}

/**
 * Creates a new category.
 * @param category - The base category to create.
 * @returns - The created category.
 */
export async function createCategory(
  category: BaseCategory
): Promise<Category> {
  const newCategory = await prisma.categories.create({
    data: {
      name: category.name,
      slug: category.name.toLowerCase().replaceAll(' ', '-'),
    },
  });
  return newCategory;
}

/**
 * Updates a category.
 * @param slug - The slug of the category to update.
 * @param category - The updated category.
 * @returns - The updated category.
 */
export async function updateCategory(
  slug: string,
  category: BaseCategory
): Promise<Category> {
  const updatedCategory = await prisma.categories.update({
    where: {
      slug: slug,
    },
    data: {
      name: category.name,
      slug: category.name.toLowerCase().replaceAll(' ', '-'),
    },
  });
  return updatedCategory;
}

/**
 * Deletes a category.
 * @param slug - The slug of the category to delete.
 */
export async function deleteCategory(slug: string) {
  await prisma.categories.delete({
    where: {
      slug: slug,
    },
  });
}
