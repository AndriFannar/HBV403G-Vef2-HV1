/**
 * @file questionRepository.ts
 * @description Makes queries to a database for questions and categories.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date February 18, 2025
 * @dependencies pg, types/question, errors/databaseErrors, repositories/repository, io/io, utils/stringUtils, json/jsonParser, io/logger
 */

import { QuestionSchema, questionSchema } from '../json/jsonSchema.js';
import { Question, Category } from '../types/question.js';
import { QueryError } from '../errors/databaseErrors.js';
import { getAllFileNames, readFile } from '../io/io.js';
import { escapeHtml } from '../utils/stringUtils.js';
import { parseJson } from '../json/jsonParser.js';
import { Repository } from './repository.js';
import { logger } from '../io/logger.js';
import pg from 'pg';

/**
 * QuestionRepository class for category and question queries.
 */
export class QuestionRepository {
  private repository: Repository;

  /**
   * Creates a new QuestionRepository instance.
   * @param repository - The repository to use for database queries.
   */
  constructor(repository: Repository) {
    this.repository = repository;
  }

  /**
   * Gets all categories in the database.
   * @returns All categories in the database.
   */
  async getCategories() {
    return this.repository.queryDatabase('SELECT * FROM categories');
  }

  /**
   * Gets a category by ID or name.
   * @param category - The ID of the category.
   * @param catName - The name of the category.
   * @returns - The category.
   */
  async getCategory(category?: number, catName?: string) {
    if (category) {
      return (
        await this.repository.queryDatabase(
          'SELECT * FROM categories WHERE id = $1',
          [category]
        )
      )[0];
    }
    return (
      await this.repository.queryDatabase(
        'SELECT * FROM categories WHERE name = $1',
        [catName]
      )
    )[0];
  }

  /**
   * Saves a category to the database.
   * @param client - The database client to use.
   * @param category - The category to save.
   * @returns - The ID of the category.
   */
  private async saveCategory(
    client: pg.PoolClient,
    category: Category
  ): Promise<number> {
    const result = await client.query(
      'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
      [category.name]
    );

    if (result.rows.length > 0) {
      return result.rows[0].id;
    }

    const selectResult = await client.query<{ id: number }>(
      'SELECT id FROM categories WHERE name = $1',
      [category.name]
    );
    if (selectResult.rows.length > 0) {
      return selectResult.rows[0].id;
    }

    throw new QueryError(
      'Unable to save/retrieve category',
      new Error('No category ID returned')
    );
  }

  /**
   * Gets all questions in a category by either name or id.
   * @param categoryId - The category to get questions for.
   * @param categoryName - The name of the category to get questions for.
   * @returns - All questions in the category.
   */
  async getQuestionsByCategory(categoryId?: number, categoryName?: string) {
    if (categoryId) {
      return this.repository.queryDatabase(
        `
        SELECT 
          q.id, 
          q.question,
          json_build_object('id', c.id, 'name', c.name) AS category,
          json_agg(
            json_build_object(
              'id', a.id, 
              'answer', a.answer, 
              'isCorrect', a.is_correct
            )
          ) AS answers
        FROM questions q
        JOIN categories c ON q.category_id = c.id
        LEFT JOIN answers a ON q.id = a.question_id
        WHERE c.id = $1
        GROUP BY q.id, q.question, c.id, c.name;
      `,
        [categoryId]
      );
    }
    return this.repository.queryDatabase(
      `
        SELECT 
          q.id, 
          q.question,
          json_build_object('id', c.id, 'name', c.name) AS category,
          json_agg(
            json_build_object(
              'id', a.id, 
              'answer', a.answer, 
              'isCorrect', a.is_correct
            )
          ) AS answers
        FROM questions q
        JOIN categories c ON q.category_id = c.id
        LEFT JOIN answers a ON q.id = a.question_id
        WHERE c.name = $1
        GROUP BY q.id, q.question, c.id, c.name;
      `,
      [categoryName]
    );
  }

  /**
   * Gets a question by ID.
   * @param id - The ID of the question.
   * @returns - The question.
   */
  async getQuestionById(id: number) {
    return (
      await this.repository.queryDatabase(
        `
        SELECT 
          q.id, 
          q.question,
          json_build_object('id', c.id, 'name', c.name) AS category,
          json_agg(
            json_build_object(
              'id', a.id, 
              'answer', a.answer, 
              'isCorrect', a.is_correct
            )
          ) AS answers
        FROM questions q
        JOIN categories c ON q.category_id = c.id
        LEFT JOIN answers a ON q.id = a.question_id
        WHERE q.id = $1
        GROUP BY q.id, q.question, c.id, c.name;
      `,
        [id]
      )
    )[0];
  }

  /**
   * Saves a question to the database.
   * @param question - The question to save.
   * @returns - The ID of the question.
   */
  async saveQuestion(question: Question) {
    return this.repository.transaction(async client => {
      if (!question.category.id) {
        question.category.id = await this.saveCategory(
          client,
          question.category
        );
      }

      const questionResult = await client.query<{ id: number }>(
        'INSERT INTO questions (question, category_id) VALUES ($1, $2) RETURNING id',
        [question.question, question.category.id]
      );
      const questionId = questionResult.rows[0].id;

      await Promise.all(
        question.answers.map(answer =>
          client.query(
            'INSERT INTO answers (question_id, answer, is_correct) VALUES ($1, $2, $3)',
            [questionId, answer.answer, answer.isCorrect]
          )
        )
      );

      return questionId;
    });
  }

  async saveQuestionsFromFile(filePath: string) {
    const files = await getAllFileNames(filePath);
    if (!files || files.length === 0) {
      logger.info('[INFO]: No data files found');
      return;
    }

    for (const file of files) {
      logger.info(`[INFO]: Reading file ${file}`);
      const contents = await readFile(`${filePath}/${file}`);
      if (contents) {
        const data = parseJson<QuestionSchema>(contents, questionSchema);
        if (data) {
          for (const question of data.questions) {
            logger.info(`[INFO]: Saving question ${question.question}`);
            const questionToSave: Question = {
              question: escapeHtml(question.question),
              category: { name: data.title },
              answers: question.answers.map(answer => ({
                answer: escapeHtml(answer.answer),
                isCorrect: answer.correct,
              })),
            };

            this.saveQuestion(questionToSave);
          }
        }
      }
    }
  }
}
