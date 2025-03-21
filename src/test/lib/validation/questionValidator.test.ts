/**
 * @file questionValidator.test.ts
 * @description Tests for the questionValidator.ts file.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 6, 2025
 * @dependencies questionValidator.ts, vitest
 */

import { validateAndSanitizeBaseQuestion } from '../../../lib/validation/questionValidator.js';
import { describe, it, expect } from 'vitest';

describe('validateAndSanitizeBaseQuestion', () => {
  it('Should validate and sanitize a valid base question', async () => {
    const input = {
      categoryId: 1,
      question: '  Test Question  ',
      answers: [
        { answer: ' Answer 1 ', isCorrect: true },
        { answer: 'Answer 2', isCorrect: false },
      ],
    };
    const result = await validateAndSanitizeBaseQuestion(input);

    expect(result).toHaveProperty('data');
    expect(result.data).toBeDefined();
    expect(result.data?.question).toBe('Test Question');
    expect(result.data?.categoryId).toBe(1);
    // eslint-disable-next-line no-magic-numbers
    expect(result.data?.answers).toHaveLength(2);
    expect(result.data?.answers[0].answer).toBe('Answer 1');
    expect(result.error).toBeUndefined();
  });

  it('Should sanitize malicious HTML from the question and answers', async () => {
    const input = {
      categoryId: 2,
      question: '<script>alert("x")</script>Clean Question',
      answers: [
        { answer: ' <img src=x onerror=alert("x")>Answer 1', isCorrect: true },
        { answer: 'Answer 2', isCorrect: false },
      ],
    };
    const result = await validateAndSanitizeBaseQuestion(input);

    expect(result).toHaveProperty('data');
    expect(result.data?.question).not.toContain('<script>');
    expect(result.data?.answers[0].answer).toContain('<img src>');
  });

  it('should return an error when required fields are missing', async () => {
    const input = { foo: '' };
    const result = await validateAndSanitizeBaseQuestion(input);

    expect(result).toHaveProperty('error');
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });
});
