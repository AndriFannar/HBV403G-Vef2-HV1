/**
 * @file categories.db.ts
 * @description Contains the database functions for the categories endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies category.js, @prisma/client, logger
 */
import { PrismaClient } from '@prisma/client';
const defaultNumCategories = 10;
const prisma = new PrismaClient();
/**
 * Gets all categories.
 * @param limit - The maximum number of categories to return.
 * @param offset - The number of categories to skip.
 * @returns - All categories between the limit and offset, if provided. Otherwise, gets 10 categories.
 *            If there are no categories, returns an empty array.
 */
export async function getCategories(limit = defaultNumCategories, offset = 0) {
    const categories = await prisma.categories.findMany({
        skip: offset,
        take: limit,
    });
    return categories ?? null;
}
/**
 * Gets a category by slug.
 * @param slug - The slug of the category to get.
 * @returns - The category with the given slug or null if not found.
 */
export async function getCategory(slug) {
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
export async function createCategory(category) {
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
export async function updateCategory(slug, category) {
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
export async function deleteCategory(slug) {
    await prisma.categories.delete({
        where: {
            slug: slug,
        },
    });
}
