/**
 * @file questions.db.test.ts
 * @description Contains the tests for the database functions for the questions endpoint of the API. Written in part by AI.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies questions.db, @prisma/client
 */
import { prisma } from '../../db/questions.db.js';
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  type Mock,
} from 'vitest';

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      questions = {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      };
      categories = {
        findFirst: vi.fn(),
      };
    },
  };
});

let questionsDb: typeof import('../../db/questions.db.js');
beforeAll(async () => {
  questionsDb = await import('../../db/questions.db.js');
});

describe('questions.db', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllQuestions returns all questions', async () => {
    const mockQuestions = [
      {
        id: 1,
        categoryId: 1,
        question: 'What is water?',
        slug: '1-what-is-water',
        answers: [
          { id: 1, questionId: 1, answer: 'H2O', isCorrect: true },
          { id: 2, questionId: 1, answer: 'CO2', isCorrect: false },
        ],
      },
      {
        id: 2,
        categoryId: 2,
        question: 'What is air?',
        slug: '2-what-is-air',
        answers: [],
      },
    ];
    (prisma.questions.findMany as unknown as Mock).mockResolvedValue(
      mockQuestions
    );

    const result = await questionsDb.getAllQuestions();
    expect(result).toEqual(mockQuestions);
    expect(prisma.questions.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      include: { answers: true },
    });
  });

  it('getQuestionsByCategory returns null if category not found', async () => {
    (prisma.categories.findFirst as unknown as Mock).mockResolvedValue(null);

    const result = await questionsDb.getQuestionsByCategory(
      'nonexistent-category'
    );
    expect(result).toBeNull();
    expect(prisma.categories.findFirst).toHaveBeenCalledWith({
      where: { slug: 'nonexistent-category' },
    });
  });

  it('getQuestionsByCategory returns questions if category is found', async () => {
    const mockCategory = { id: 1, name: 'Category 1', slug: 'category-1' };
    (prisma.categories.findFirst as unknown as Mock).mockResolvedValue(
      mockCategory
    );
    const mockQuestions = [
      {
        id: 1,
        categoryId: 1,
        question: 'What is water?',
        slug: '1-what-is-water',
        answers: [],
      },
    ];
    (prisma.questions.findMany as unknown as Mock).mockResolvedValue(
      mockQuestions
    );

    const result = await questionsDb.getQuestionsByCategory('category-1');
    expect(result).toEqual(mockQuestions);
    expect(prisma.categories.findFirst).toHaveBeenCalledWith({
      where: { slug: 'category-1' },
    });
    expect(prisma.questions.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      where: { categoryId: mockCategory.id },
      include: { answers: true },
    });
  });

  it('getQuestionBySlug returns question when found', async () => {
    const mockQuestion = {
      id: 1,
      categoryId: 1,
      question: 'What is water?',
      slug: '1-what-is-water',
      answers: [],
    };
    (prisma.questions.findFirst as unknown as Mock).mockResolvedValue(
      mockQuestion
    );

    const result = await questionsDb.getQuestionBySlug('1-what-is-water');
    expect(result).toEqual(mockQuestion);
    expect(prisma.questions.findFirst).toHaveBeenCalledWith({
      where: { slug: '1-what-is-water' },
      include: { answers: true },
    });
  });

  it('createQuestion creates a new question', async () => {
    const baseQuestion = {
      categoryId: 1,
      question: 'What is water?',
      answers: [
        { answer: 'H2O', isCorrect: true },
        { answer: 'CO2', isCorrect: false },
      ],
    };
    const newQuestion = {
      id: 42,
      categoryId: 1,
      question: baseQuestion.question,
      slug: 'temporary-slug',
      answers: [
        { id: 1, questionId: 42, answer: 'H2O', isCorrect: true },
        { id: 2, questionId: 42, answer: 'CO2', isCorrect: false },
      ],
    };
    (prisma.questions.create as unknown as Mock).mockResolvedValue(newQuestion);
    const updatedQuestion = { ...newQuestion, slug: '42-what-is-water' };
    (prisma.questions.update as unknown as Mock).mockResolvedValue(
      updatedQuestion
    );

    const result = await questionsDb.createQuestion(baseQuestion);
    expect(result).toEqual(updatedQuestion);
    expect(prisma.questions.create).toHaveBeenCalledWith({
      data: {
        categoryId: baseQuestion.categoryId,
        question: baseQuestion.question,
        slug: expect.any(String),
        answers: { create: baseQuestion.answers },
      },
      include: { answers: true },
    });
    expect(prisma.questions.update).toHaveBeenCalledWith({
      where: { id: newQuestion.id },
      data: { slug: '42-what-is-water' },
      include: { answers: true },
    });
  });

  it('updateQuestion returns null if question not found', async () => {
    (prisma.questions.findFirst as unknown as Mock).mockResolvedValue(null);
    const updatePayload = {
      id: 1,
      categoryId: 1,
      question: 'Updated question',
      slug: 'updated-question',
      answers: [
        { answer: 'Updated H2O', isCorrect: true },
        { answer: 'Updated CO2', isCorrect: false },
      ],
    };

    const result = await questionsDb.updateQuestion(
      'nonexistent-slug',
      updatePayload
    );
    expect(result).toBeNull();
    expect(prisma.questions.findFirst).toHaveBeenCalledWith({
      where: { slug: 'nonexistent-slug' },
      include: { answers: true },
    });
  });

  it('updateQuestion updates and returns the question when found', async () => {
    const existingQuestion = {
      id: 1,
      categoryId: 1,
      question: 'What is water?',
      slug: '1-what-is-water',
      answers: [
        { id: 1, questionId: 1, answer: 'H2O', isCorrect: true },
        { id: 2, questionId: 1, answer: 'CO2', isCorrect: false },
      ],
    };
    (prisma.questions.findFirst as unknown as Mock).mockResolvedValue(
      existingQuestion
    );

    const updatePayload = {
      id: 1,
      categoryId: 1,
      question: 'Updated question',
      slug: 'updated-question',
      answers: [
        { answer: 'Updated H2O', isCorrect: true },
        { answer: 'Updated CO2', isCorrect: false },
      ],
    };

    const updatedQuestion = {
      id: 1,
      categoryId: 1,
      question: 'Updated question',
      slug: '1-updated-question',
      answers: [
        { id: 3, questionId: 1, answer: 'Updated H2O', isCorrect: true },
        { id: 4, questionId: 1, answer: 'Updated CO2', isCorrect: false },
      ],
    };
    (prisma.questions.update as unknown as Mock).mockResolvedValue(
      updatedQuestion
    );

    const result = await questionsDb.updateQuestion(
      '1-what-is-water',
      updatePayload
    );
    expect(result).toEqual(updatedQuestion);
    expect(prisma.questions.findFirst).toHaveBeenCalledWith({
      where: { slug: '1-what-is-water' },
      include: { answers: true },
    });
    expect(prisma.questions.update).toHaveBeenCalledWith({
      where: { id: existingQuestion.id },
      data: {
        categoryId: updatePayload.categoryId,
        question: updatePayload.question,
        slug: '1-updated-question',
        answers: {
          deleteMany: {},
          create: updatePayload.answers.map(a => ({
            answer: a.answer,
            isCorrect: a.isCorrect,
          })),
        },
      },
      include: { answers: true },
    });
  });

  it('deleteQuestion deletes a question', async () => {
    (prisma.questions.delete as unknown as Mock).mockResolvedValue(undefined);
    await expect(
      questionsDb.deleteQuestion('1-what-is-water')
    ).resolves.toBeUndefined();
    expect(prisma.questions.delete).toHaveBeenCalledWith({
      where: { slug: '1-what-is-water' },
    });
  });
});
