/**
 * @file category.test.ts
 * @description Tests for the category.ts file.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 6, 2025
 * @dependencies category.ts, vitest
 */

import { describe, it, expect } from 'vitest';
import {
  BaseCategorySchema,
  CategorySchema,
  CategoryQuestionsSchema,
} from '../../entities/category.js';

describe('BaseCategorySchema', () => {
  it('Should parse a valid base category', () => {
    const input = { name: 'Valid Category' };
    const result = BaseCategorySchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Valid Category');
    }
  });

  it('Should fail when name is too short', () => {
    const input = { name: 'AB' };
    const result = BaseCategorySchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 3 letters');
    }
  });

  it('Should fail when name is too long', () => {
    // eslint-disable-next-line no-magic-numbers
    const longName = 'A'.repeat(65);
    const input = { name: longName };
    const result = BaseCategorySchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at most 64 letters');
    }
  });
});

describe('CategorySchema', () => {
  it('Should parse a valid category', () => {
    const input = { name: 'Valid Category', id: 1, slug: 'valid-category' };
    const result = CategorySchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(1);
      expect(result.data.slug).toBe('valid-category');
    }
  });

  it('Should fail if id is missing', () => {
    const input = { name: 'Valid Category', slug: 'valid-category' };
    const result = CategorySchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('Should fail if slug is empty', () => {
    const input = { name: 'Valid Category', id: 1, slug: '' };
    const result = CategorySchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe('CategoryQuestionsSchema', () => {
  it('Should parse a valid category with questions', () => {
    const input = {
      name: 'Science',
      id: 2,
      slug: 'science',
      questions: [
        {
          id: 10,
          categoryId: 2,
          question: 'What is water?',
          slug: 'what-is-water',
          answers: [
            { id: 100, questionId: 10, answer: 'H2O', isCorrect: true },
            { id: 101, questionId: 10, answer: 'CO2', isCorrect: false },
          ],
        },
      ],
    };
    const result = CategoryQuestionsSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.questions).toHaveLength(1);
      // eslint-disable-next-line no-magic-numbers
      expect(result.data.questions[0].answers).toHaveLength(2);
    }
  });

  it('Should fail if questions is not an array', () => {
    const input = {
      name: 'Science',
      id: 2,
      slug: 'science',
      questions: 'not an array',
    };
    const result = CategoryQuestionsSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
