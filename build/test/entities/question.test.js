/* eslint-disable no-magic-numbers */
/**
 * @file question.test.ts
 * @description Tests for the question.ts file.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 6, 2025
 * @dependencies question.ts, vitest
 */
import { BaseQuestionSchema, QuestionSchema } from '../../entities/question.js';
import { describe, it, expect } from 'vitest';
describe('BaseQuestionSchema', () => {
    const validBaseQuestion = {
        categoryId: 1,
        question: 'What is the capital of France?',
        answers: [
            { answer: 'Paris', isCorrect: true },
            { answer: 'London', isCorrect: false },
        ],
    };
    it('Should parse a valid base question', () => {
        const result = BaseQuestionSchema.safeParse(validBaseQuestion);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.categoryId).toBe(1);
            expect(result.data.question).toBe('What is the capital of France?');
            expect(result.data.answers).toHaveLength(2);
        }
    });
    it('Should fail if question is too short', () => {
        const input = { ...validBaseQuestion, question: 'Hi' };
        const result = BaseQuestionSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toContain('at least 3 letters');
        }
    });
    it('Should fail if question is too long', () => {
        const longQuestion = 'a'.repeat(501);
        const input = { ...validBaseQuestion, question: longQuestion };
        const result = BaseQuestionSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toContain('at most 500 letters');
        }
    });
    it('Should fail if there are not enough answers', () => {
        const input = {
            ...validBaseQuestion,
            answers: [{ answer: 'Paris', isCorrect: true }],
        };
        const result = BaseQuestionSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toContain('Question must have');
        }
    });
});
describe('QuestionSchema', () => {
    const validQuestion = {
        id: 10,
        categoryId: 1,
        question: 'What is the capital of France?',
        slug: 'what-is-the-capital-of-france',
        answers: [
            { answer: 'Paris', isCorrect: true },
            { answer: 'London', isCorrect: false },
        ],
    };
    it('Should parse a valid question', () => {
        const result = QuestionSchema.safeParse(validQuestion);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.id).toBe(10);
            expect(result.data.slug).toBe('what-is-the-capital-of-france');
            expect(result.data.answers).toHaveLength(2);
        }
    });
    it('Should fail if id is missing', () => {
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        const { id, ...inputWithoutId } = validQuestion;
        const result = QuestionSchema.safeParse(inputWithoutId);
        expect(result.success).toBe(false);
    });
    it('Should fail if slug is empty', () => {
        const input = { ...validQuestion, slug: '' };
        const result = QuestionSchema.safeParse(input);
        expect(result.success).toBe(false);
    });
});
