import { QuestionRepository } from '../../lib/repositories/questionRepository.js';
import { Repository } from '../../lib/repositories/repository.js';
import { Question } from '../../lib/types/question.js';
import { schema } from '../../sql/schema.js';
import dotenv from 'dotenv';
import {
  expect,
  test,
  afterEach,
  beforeEach,
  beforeAll,
  afterAll,
} from 'vitest';

dotenv.config();

const repository = new Repository(process.env.TEST_DATABASE_URL);
const questionRepository = new QuestionRepository(repository);

const question: Question = {
  category: { name: 'Test' },
  question: 'Test question',
  answers: [
    { answer: 'Answer 1', isCorrect: true },
    { answer: 'Answer 2', isCorrect: false },
  ],
};

async function clearDatabase() {
  await repository.queryDatabase(
    'TRUNCATE TABLE answers, questions, categories RESTART IDENTITY CASCADE'
  );
}

beforeAll(async () => {
  await repository.queryDatabase(schema);
});

beforeEach(async () => {
  await clearDatabase();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await repository.queryDatabase('DROP TABLE answers, questions, categories');
});

test('saveQuestion saves Question and getQuestionById retreives it', async () => {
  const result = await questionRepository.saveQuestion(question);

  const savedQuestion = await questionRepository.getQuestionById(result);
  expect(savedQuestion.id).toBe(result);
  expect(savedQuestion.question).toBe(question.question);
});

test('getCategory returns Categories', async () => {
  await questionRepository.saveQuestion(question);

  const categories = await questionRepository.getCategories();
  expect(categories.length).toBeGreaterThan(0);
  const category = await questionRepository.getCategory(
    undefined,
    question.category.name
  );
  expect(category).toBeDefined();
  expect(category.name).toBe(question.category.name);
  expect(category.id).toBe(categories[0].id);
});

test('saveQuestion saves Question with existing category', async () => {
  await questionRepository.saveQuestion(question);
  const categories = await questionRepository.getCategories();

  question.question = 'New question';
  await questionRepository.saveQuestion(question);

  const questions = await questionRepository.getQuestionsByCategory(
    categories[0].id
  );
  const categoriesAfter = await questionRepository.getCategories();
  expect(categoriesAfter.length).toBe(categories.length);
  expect(questions.length).toBe(2);
});

test('getQuestionsByCategory returns Questions', async () => {
  await questionRepository.saveQuestion(question);
  const categories = await questionRepository.getCategories();
  console.log(categories);
  const questions = await questionRepository.getQuestionsByCategory(
    categories[0].id
  );
  expect(questions).toBeDefined();
  expect(questions.length).toBeGreaterThan(0);
  expect(questions[0].category_id).toBe(categories[0].id);
});

test('getQuestionsByCategory returns empty array for non-existant category', async () => {
  const questions = await questionRepository.getQuestionsByCategory(-1);
  expect(questions).toBeDefined();
  expect(questions.length).toBe(0);
});
