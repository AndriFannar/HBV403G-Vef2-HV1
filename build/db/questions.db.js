/**
 * @file questions.db.ts
 * @description Contains the database functions for the questions endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies questions.js, category.js, @prisma/client, crypto
 */
import { PrismaClient } from '@prisma/client';
import { randomInt } from 'crypto';
const maxRandint = 281474976710655;
const maxSlugLength = 64;
const defaultNumQuestions = 10;
const prisma = new PrismaClient();
/**
 * Generates a slug for a question.
 * @param question - The question string to generate a slug for.
 * @param id - The id of the question.
 * @returns - The generated slug.
 */
function generateSlug(question, id) {
    return (id.toString() +
        '-' +
        question
            .toLowerCase()
            .replaceAll(' ', '-')
            .replaceAll(/[^a-z0-9-]/g, '')
            .slice(0, maxSlugLength - id.toString().length - 1));
}
/**
 * Gets all questions.
 * @param limit - The maximum number of questions to return.
 * @param offset - The number of questions to skip.
 * @returns - All questions between the limit and offset, if provided. Otherwise, gets 10 questions.
 *            If there are no questions, returns an empty array.
 */
export async function getAllQuestions(limit = defaultNumQuestions, offset = 0) {
    const questions = await prisma.questions.findMany({
        skip: offset,
        take: limit,
        include: {
            answers: true,
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
export async function getQuestionsByCategory(slug, limit = defaultNumQuestions, offset = 0) {
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
export async function getQuestionBySlug(slug) {
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
export async function createQuestion(question) {
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
export async function updateQuestion(slug, question) {
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
    const answersUpdate = question.answers && question.answers.length > 0
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
export async function deleteQuestion(slug) {
    await prisma.questions.delete({
        where: {
            slug: slug,
        },
    });
}
