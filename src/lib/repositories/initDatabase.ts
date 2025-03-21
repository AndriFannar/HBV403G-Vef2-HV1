/**
 * @file initDatabase.ts
 * @description Initializes the database specified in the .env file with the necessary tables.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date February 20, 2025
 * @dependencies pg, dotenv, QuestionRepository, schema
 */

import { Repository } from './repository.js';
import dotenv from 'dotenv';
import { QuestionRepository } from './questionRepository.js';
import { schema } from '../../sql/schema.js';

dotenv.config();

/**
 * Initializes the database with the necessary tables.
 * @param repository - The repository to use for database queries.
 */
export async function initDatabase(repository?: Repository) {
  if (!repository) {
    repository = new Repository(process.env.DATABASE_URL);
  }
  const questionRepository = new QuestionRepository(repository);
  await repository.queryDatabase(schema);

  // Get all files in data directory
  const dataDir = './data';
  questionRepository.saveQuestionsFromFile(dataDir);
}
