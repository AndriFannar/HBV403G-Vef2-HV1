/**
 * @file categoryValidator.ts
 * @description Validates and sanitizes a category.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies validator.ts, slug.ts, zod, xss
 */
import { BaseCategorySchema } from '../../entities/category.js';
import { Validator } from '../../entities/validator.js';
import { z } from 'zod';
import xss from 'xss';
/**
 * Validates and sanitizes a base (new) category.
 * @param data - The base category to validate and sanitize.
 * @returns - The validated and sanitized base category or an error.
 */
export const validateAndSanitizeBaseCategory = async (data) => {
    const parsed = await BaseCategorySchema.safeParseAsync(data);
    if (!parsed.success) {
        return { error: parsed.error.format() };
    }
    const sanitizedData = {
        name: xss(parsed.data.name.trim()),
    };
    return { data: sanitizedData };
};
