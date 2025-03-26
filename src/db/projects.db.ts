/**
 * @file projects.db.ts
 * @description Contains the database functions for the projects endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 26, 2025
 * @dependencies
 */

import type { Project, BaseProject } from '../entities/project.js';
import { PrismaClient } from '@prisma/client';

const maxSlugLength = 64;
const defaultNumProjects = 10;

export const prisma = new PrismaClient();

/**
 * Generates a slug for a project.
 * @param projectName - The projectName string to generate a slug for.
 * @param id - The id of the project.
 * @returns - The generated slug.
 */
function generateSlug(projectName: string, id: number): string {
  return (
    id.toString() +
    '-' +
    projectName
      .toLowerCase()
      .replaceAll(' ', '-')
      .replaceAll(/[^a-z0-9-]/g, '')
      .slice(0, maxSlugLength - id.toString().length - 1)
  );
}

/**
 * Gets all projects.
 * @param limit - The maximum number of projects to return at a time.
 * @param offset - The number of projects to skip.
 * @returns - All projects between the limit and offset, if provided. Otherwise, gets 10 projects.
 *            If there are no projects, returns an empty array.
 */
export async function getAllProjects(
  limit: number = defaultNumProjects,
  offset: number = 0
): Promise<Array<Project>> {
  const questions = await prisma.project.findMany({
    skip: offset,
    take: limit,
    include: {
      useCases: true,
      actors: true,
      businessRules: true,
    },
  });
  return questions ?? null;
}

/**
 * Gets questions by category.
 * @param slug - The slug of the category to get questions from.
 * @param limit - The maximum number of questions to return.
 * @param offset - The number of questions to skip.
 * @returns - All questions in the category with given slug between the limit and offset, if provided. Otherwise, gets 10 questions.
 *            If the category does not exist, returns null.
 */
export async function getQuestionsByCategory(
  slug: string,
  limit: number = defaultNumQuestions,
  offset: number = 0
): Promise<Array<Question> | null> {
  const category = await prisma.categories.findFirst({
    where: {
      slug: slug,
    },
  });

  if (!category) {
    return null;
  }

  const categoryWithQuestions = await prisma.questions.findMany({
    skip: offset,
    take: limit,
    where: {
      categoryId: category.id,
    },
    include: {
      answers: true,
    },
  });

  return categoryWithQuestions ?? null;
}

/**
 * Gets a question by its slug.
 * @param slug - The slug of the question to get.
 * @returns - The question with the given slug, if any. Otherwise, null.
 */
export async function getQuestionBySlug(
  slug: string
): Promise<Question | null> {
  const question = await prisma.questions.findFirst({
    where: {
      slug: slug,
    },
    include: {
      answers: true,
    },
  });

  return question ?? null;
}

/**
 * Creates a new question.
 * @param question - The question to create.
 * @returns - The created question.
 */
export async function createQuestion(
  question: BaseQuestion
): Promise<Question> {
  const newQuestion = await prisma.questions.create({
    data: {
      categoryId: question.categoryId,
      question: question.question,
      slug: randomInt(maxRandint).toString(),
      answers: {
        create: question.answers,
      },
    },
    include: {
      answers: true,
    },
  });

  const newSlug = generateSlug(newQuestion.question, newQuestion.id);

  return await prisma.questions.update({
    where: {
      id: newQuestion.id,
    },
    data: {
      slug: newSlug,
    },
    include: {
      answers: true,
    },
  });
}

/**
 * Updates a question.
 * @param slug - The slug of the question to update.
 * @param question - The updated question.
 * @returns - The updated question, if it exists. Otherwise, null.
 */
export async function updateQuestion(
  slug: string,
  question: Question
): Promise<Question | null> {
  const existingQuestion = await prisma.questions.findFirst({
    where: {
      slug: slug,
    },
    include: {
      answers: true,
    },
  });

  if (!existingQuestion) {
    return null;
  }

  const newSlug = generateSlug(question.question, question.id);

  const answersUpdate =
    question.answers && question.answers.length > 0
      ? {
          deleteMany: {},
          create: question.answers.map(answer => ({
            answer: answer.answer,
            isCorrect: answer.isCorrect,
          })),
        }
      : undefined;

  const updatedQuestion = await prisma.questions.update({
    where: {
      id: existingQuestion.id,
    },
    data: {
      categoryId: question.categoryId,
      question: question.question,
      slug: newSlug,
      ...(answersUpdate ? { answers: answersUpdate } : {}),
    },
    include: {
      answers: true,
    },
  });

  return updatedQuestion;
}

/**
 * Deletes a question.
 * @param slug - The slug of the question to delete.
 */
export async function deleteQuestion(slug: string) {
  await prisma.questions.delete({
    where: {
      slug: slug,
    },
  });
}
