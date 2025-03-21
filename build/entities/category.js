/**
 * @file category.ts
 * @description Contains the schema for a base (new) category, a category without questions, and a category with questions.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies zod, question.ts
 */
import { QuestionSchema } from './question.js';
import { z } from 'zod';
const minTitleLength = 3;
const maxTitleLength = 64;
/**
 * A schema for validating a base (new) category.
 */
export const BaseCategorySchema = z.object({
    name: z
        .string()
        .min(minTitleLength, `Title must be at least ${minTitleLength} letters`)
        .max(maxTitleLength, `Title must be at most ${maxTitleLength} letters`),
});
/**
 * A schema for validating a category.
 */
export const CategorySchema = BaseCategorySchema.extend({
    id: z.number(),
    slug: z.string().nonempty(),
});
/**
 * A schema for validating a category with questions.
 */
export const CategoryQuestionsSchema = CategorySchema.extend({
    questions: z.array(QuestionSchema),
});
