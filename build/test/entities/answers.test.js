/**
 * @file answers.test.ts
 * @description Tests for the answers.ts file.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 6, 2025
 * @dependencies answer.ts, vitest
 */
import { describe, it, expect } from 'vitest';
import { BaseAnswerSchema, AnswerSchema } from '../../entities/answer.js';
describe('BaseAnswerSchema', () => {
    it('Should parse a valid base answer', () => {
        const input = { answer: 'This is a valid answer.', isCorrect: true };
        const result = BaseAnswerSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.answer).toBe(input.answer);
            expect(result.data.isCorrect).toBe(input.isCorrect);
        }
    });
    it('Should fail if answer is too short', () => {
        const input = { answer: 'Hi', isCorrect: false };
        const result = BaseAnswerSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toContain('Content must be at least');
        }
    });
    it('Should fail if answer is empty', () => {
        const input = { answer: '', isCorrect: true };
        const result = BaseAnswerSchema.safeParse(input);
        expect(result.success).toBe(false);
    });
    it('Should fail if answer is too long', () => {
        // eslint-disable-next-line no-magic-numbers
        const longText = 'a'.repeat(501);
        const input = { answer: longText, isCorrect: false };
        const result = BaseAnswerSchema.safeParse(input);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toContain('Content must be at most');
        }
    });
});
describe('AnswerSchema', () => {
    it('Should parse a valid answer', () => {
        const input = {
            id: 1,
            questionId: 10,
            answer: 'A valid answer.',
            isCorrect: true,
        };
        const result = AnswerSchema.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.id).toBe(1);
            // eslint-disable-next-line no-magic-numbers
            expect(result.data.questionId).toBe(10);
            expect(result.data.answer).toBe(input.answer);
            expect(result.data.isCorrect).toBe(input.isCorrect);
        }
    });
    it('Should fail if id is missing', () => {
        const input = {
            questionId: 10,
            answer: 'Valid answer',
            isCorrect: false,
        };
        const result = AnswerSchema.safeParse(input);
        expect(result.success).toBe(false);
    });
    it('Should fail if questionId is missing', () => {
        const input = {
            id: 2,
            answer: 'Valid answer',
            isCorrect: true,
        };
        const result = AnswerSchema.safeParse(input);
        expect(result.success).toBe(false);
    });
});
