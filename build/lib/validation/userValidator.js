/**
 * @file userValidator.ts
 * @description Validates and sanitizes a user.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies validator.ts, slug.ts, zod, xss
 */
import { Validator } from '../../entities/validator.js';
import { NewUserSchema } from '../../entities/user.js';
import { z } from 'zod';
import xss from 'xss';
/**
 * Validates and sanitizes a base (new) user.
 * @param data - The base user to validate and sanitize.
 * @returns - The validated and sanitized base user or an error.
 */
export const validateAndSanitizeBaseUser = async (data) => {
    const parsed = await NewUserSchema.safeParseAsync(data);
    if (!parsed.success) {
        return { error: parsed.error.format() };
    }
    const sanitizedData = {
        username: xss(parsed.data.username.trim()),
        password: parsed.data.password.trim(),
    };
    return { data: sanitizedData };
};
