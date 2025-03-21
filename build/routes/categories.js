/**
 * @file categories.ts
 * @description Contains the routes for the categories endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies hono, logger.ts, slugValidator.ts, categoryValidator.ts, categories.db.ts, http-status-codes
 */
import { validateAndSanitizeBaseCategory } from '../lib/validation/categoryValidator.js';
import { validateAndSanitizeSlug } from '../lib/validation/slugValidator.js';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/io/logger.js';
import { createCategory, deleteCategory, getCategories, getCategory, updateCategory, } from '../db/categories.db.js';
import { Hono } from 'hono';
export const categoriesApp = new Hono()
    /**
     * @description Get all categories
     */
    .get('/', async (c) => {
    try {
        const categories = await getCategories();
        return c.json(categories);
    }
    catch (e) {
        logger.error('Failed to get categories:', e);
        throw e;
    }
})
    /**
     * @description Get a category by slug
     */
    .get('/:slug', async (c) => {
    try {
        const slug = await validateAndSanitizeSlug(c.req.param('slug'));
        if (!slug.data) {
            return c.json({ message: 'Invalid slug' }, StatusCodes.BAD_REQUEST);
        }
        const category = await getCategory(slug.data);
        if (!category) {
            return c.json({ message: 'Category not found' }, StatusCodes.NOT_FOUND);
        }
        return c.json(category);
    }
    catch (e) {
        logger.error('Failed to get category:', e);
        throw e;
    }
})
    /**
     * @description Create a new category
     */
    .post('/', async (c) => {
    try {
        let newCategory;
        try {
            newCategory = await c.req.json();
        }
        catch {
            return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
        }
        const validCategory = await validateAndSanitizeBaseCategory(newCategory);
        if (!validCategory.data) {
            return c.json({ message: 'Invalid data', errors: validCategory.error }, StatusCodes.BAD_REQUEST);
        }
        const createdCategory = await createCategory(validCategory.data);
        return c.json(createdCategory, StatusCodes.CREATED);
    }
    catch (e) {
        logger.error('Failed to create category:', e);
        throw e;
    }
})
    /**
     * @description Update a category by slug
     */
    .patch('/:slug', async (c) => {
    try {
        let updatedCategoryInfo;
        try {
            updatedCategoryInfo = await c.req.json();
        }
        catch {
            return c.json({ message: 'Invalid JSON' }, StatusCodes.BAD_REQUEST);
        }
        const slug = await validateAndSanitizeSlug(c.req.param('slug'));
        if (!slug.data) {
            return c.json({ message: 'Invalid slug' }, StatusCodes.BAD_REQUEST);
        }
        if ((await getCategory(slug.data)) === null) {
            return c.json({ message: 'Category not found' }, StatusCodes.NOT_FOUND);
        }
        const validCategory = await validateAndSanitizeBaseCategory(updatedCategoryInfo);
        if (!validCategory.data) {
            return c.json({ message: 'Invalid data', errors: validCategory.error }, StatusCodes.BAD_REQUEST);
        }
        const updatedCategory = await updateCategory(c.req.param('slug'), validCategory.data);
        return c.json(updatedCategory);
    }
    catch (e) {
        logger.error('Failed to update category:', e);
        throw e;
    }
})
    /**
     * @description Delete a category by slug
     */
    .delete('/:slug', async (c) => {
    try {
        const slug = await validateAndSanitizeSlug(c.req.param('slug'));
        if (!slug.data) {
            return c.json({ message: 'Invalid slug' }, StatusCodes.BAD_REQUEST);
        }
        if ((await getCategory(slug.data)) === null) {
            return c.json({ message: 'Category not found' }, StatusCodes.NOT_FOUND);
        }
        await deleteCategory(slug.data);
        return c.body(null, StatusCodes.NO_CONTENT);
    }
    catch (e) {
        logger.error('Failed to delete category:', e);
        throw e;
    }
})
    /**
     * @description Error handling for internal server errors
     */
    .onError((err, c) => {
    logger.error('Internal Server Error:', err);
    return c.json({ message: 'Internal Server Error' }, StatusCodes.INTERNAL_SERVER_ERROR);
});
