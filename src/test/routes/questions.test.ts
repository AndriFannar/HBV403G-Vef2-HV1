/**
 * @file questions.test.ts
 * @description Tests for the questions.ts file. Generated in part by AI.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies questions.ts, vitest, http-status-codes, questions.db.ts
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { questionsApp } from '../../routes/questions.routes.js';
import { StatusCodes } from 'http-status-codes';

import * as questionsDb from '../../db/questions.db.js';
vi.mock('../../db/questions.db.js', () => ({
  getAllQuestions: vi.fn(),
  createQuestion: vi.fn(),
  getQuestionsByCategory: vi.fn(),
  getQuestionBySlug: vi.fn(),
  updateQuestion: vi.fn(),
  deleteQuestion: vi.fn(),
}));

describe('Questions API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET / returns all questions', async () => {
    const sampleQuestions = [
      {
        id: 1,
        categoryId: 1,
        question: 'What is water?',
        slug: 'what-is-water',
        answers: [
          { id: 1, questionId: 1, answer: 'H2O', isCorrect: true },
          { id: 2, questionId: 1, answer: 'CO2', isCorrect: false },
        ],
      },
    ];
    (questionsDb.getAllQuestions as unknown as Mock).mockResolvedValue(
      sampleQuestions
    );

    const req = new Request('http://localhost/', { method: 'GET' });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.OK);
    const data = await res.json();
    expect(data).toEqual(sampleQuestions);
  });

  it('GET /:slug returns 400 if slug is invalid', async () => {
    const req = new Request('http://localhost/INVALID_slug!', {
      method: 'GET',
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    const data = await res.json();
    expect(data.message).toBe('Invalid slug');
  });

  it('GET /:slug returns 404 if category not found', async () => {
    (questionsDb.getQuestionsByCategory as unknown as Mock).mockResolvedValue(
      null
    );
    const req = new Request('http://localhost/test-category', {
      method: 'GET',
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
    const data = await res.json();
    expect(data.message).toBe('Category not found');
  });

  it('GET /:slug returns questions if category found', async () => {
    const sampleQuestions = [
      {
        id: 1,
        categoryId: 1,
        question: 'What is water?',
        slug: 'what-is-water',
        answers: [
          { id: 1, questionId: 1, answer: 'H2O', isCorrect: true },
          { id: 2, questionId: 1, answer: 'CO2', isCorrect: false },
        ],
      },
    ];
    (questionsDb.getQuestionsByCategory as unknown as Mock).mockResolvedValue(
      sampleQuestions
    );

    const req = new Request('http://localhost/what-is-water', {
      method: 'GET',
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.OK);
    const data = await res.json();
    expect(data).toEqual(sampleQuestions);
  });

  it('POST / returns 400 if invalid JSON is sent', async () => {
    const req = new Request('http://localhost/', {
      method: 'POST',
      body: 'invalid json',
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    const data = await res.json();
    expect(data.message).toBe('Invalid JSON');
  });

  it('POST / returns 400 if invalid data is sent', async () => {
    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wrong: 'data' }),
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    const data = await res.json();
    expect(data.message).toBe('Invalid data');
  });

  it('POST / returns 201 when a valid question is created', async () => {
    const validQuestionInput = {
      categoryId: 1,
      question: 'What is water?',
      answers: [
        { answer: 'H2O', isCorrect: true },
        { answer: 'CO2', isCorrect: false },
      ],
    };
    const createdQuestion = {
      id: 1,
      categoryId: 1,
      question: 'What is water?',
      slug: 'what-is-water',
      answers: [
        { id: 1, questionId: 1, answer: 'H2O', isCorrect: true },
        { id: 2, questionId: 1, answer: 'CO2', isCorrect: false },
      ],
    };

    (questionsDb.createQuestion as unknown as Mock).mockResolvedValue(
      createdQuestion
    );

    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validQuestionInput),
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.CREATED);
    const data = await res.json();
    expect(data).toEqual(createdQuestion);
  });

  it('PATCH /:slug returns 400 if invalid JSON is sent', async () => {
    const req = new Request('http://localhost/what-is-water', {
      method: 'PATCH',
      body: 'invalid json',
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    const data = await res.json();
    expect(data.message).toBe('Invalid JSON');
  });

  it('PATCH /:slug returns 400 if invalid data is sent', async () => {
    const req = new Request('http://localhost/what-is-water', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wrong: 'data' }),
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    const data = await res.json();
    expect(data.message).toBe('Invalid data');
  });

  it('PATCH /:slug returns 404 if question not found', async () => {
    (questionsDb.updateQuestion as unknown as Mock).mockResolvedValue(null);
    const req = new Request('http://localhost/what-is-water', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        categoryId: 1,
        question: 'Updated question',
        slug: 'what-is-water',
        answers: [
          { answer: 'H2O', isCorrect: true },
          { answer: 'CO2', isCorrect: false },
        ],
      }),
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
    const data = await res.json();
    expect(data.message).toBe('Question not found');
  });

  it('PATCH /:slug returns updated question on valid update', async () => {
    const updatedQuestion = {
      id: 1,
      categoryId: 1,
      question: 'Updated question',
      slug: 'updated-question',
      answers: [
        { id: 1, questionId: 1, answer: 'H2O', isCorrect: true },
        { id: 2, questionId: 1, answer: 'CO2', isCorrect: false },
      ],
    };
    (questionsDb.updateQuestion as unknown as Mock).mockResolvedValue(
      updatedQuestion
    );

    const req = new Request('http://localhost/what-is-water', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        categoryId: 1,
        question: 'Updated question',
        slug: 'what-is-water',
        answers: [
          { answer: 'H2O', isCorrect: true },
          { answer: 'CO2', isCorrect: false },
        ],
      }),
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.OK);
    const data = await res.json();
    expect(data).toEqual(updatedQuestion);
  });

  it('DELETE /:slug returns 400 if slug is invalid', async () => {
    const req = new Request('http://localhost/INVALID slug!', {
      method: 'DELETE',
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
    const data = await res.json();
    expect(data.message).toBe('Invalid slug');
  });

  it('DELETE /:slug returns 404 if question not found', async () => {
    (questionsDb.getQuestionBySlug as unknown as Mock).mockResolvedValue(null);
    const req = new Request('http://localhost/what-is-water', {
      method: 'DELETE',
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.NOT_FOUND);
    const data = await res.json();
    expect(data.message).toBe('Question not found');
  });

  it('DELETE /:slug returns 204 on successful deletion', async () => {
    const sampleQuestion = {
      id: 1,
      categoryId: 1,
      question: 'What is water?',
      slug: 'what-is-water',
      answers: [
        { id: 1, questionId: 1, answer: 'H2O', isCorrect: true },
        { id: 2, questionId: 1, answer: 'CO2', isCorrect: false },
      ],
    };
    (questionsDb.getQuestionBySlug as unknown as Mock).mockResolvedValue(
      sampleQuestion
    );
    (questionsDb.deleteQuestion as unknown as Mock).mockResolvedValue(
      undefined
    );

    const req = new Request('http://localhost/what-is-water', {
      method: 'DELETE',
    });
    const res = await questionsApp.request(req);
    expect(res.status).toBe(StatusCodes.NO_CONTENT);
    const text = await res.text();
    expect(text).toBe('');
  });
});
