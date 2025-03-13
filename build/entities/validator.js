/**
 * @file validator.ts
 * @description A generic validator return type for any schema.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies zod
 */
import { z, ZodType } from 'zod';
/**
 * A generic validator return type for any schema.
 * @param schema - The schema to validate.
 * @returns - The validated data or an error.
 */
export const Validator = (schema) => z.object({
    data: schema.optional(),
    error: z.any().optional(),
});
