/**
 * @file routes.ts
 * @description Sets up the routes for the application.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date February 18, 2025
 * @dependencies express, QuestionRepository, Repository, Question, config, Strings, NotFoundError, escapeHtml, xss
 */

import { QuestionRepository } from './lib/repositories/questionRepository.js';
import { Repository } from './lib/repositories/repository.js';
import { NotFoundError } from './lib/errors/notFoundError.js';
import express, { ErrorRequestHandler } from 'express';
import { Question } from './lib/types/question.js';
import * as Strings from './res/strings.js';
import * as config from './config.js';
import xss from 'xss';

export const router = express.Router();
const repository = new Repository(process.env.DATABASE_URL);
const questionRepository = new QuestionRepository(repository);

/**
 * Displays the home page.
 */
router.get('/', async (req, res) => {
  console.log('Received request');
  const categories = await questionRepository.getCategories();

  res.render('index', { title: Strings.title, categories });
});

/**
 * Displays a list of questions in a category.
 */
router.get('/spurningar/:id', async (req, res, next) => {
  const categoryId = Number(req.params.id);
  if (isNaN(categoryId)) {
    return next(new NotFoundError(Strings.categoryNotFound));
  }

  const questions = await questionRepository.getQuestionsByCategory(categoryId);

  res.render('questions', {
    title: Strings.title,
    questionString: Strings.questionString,
    noQuestions: Strings.noQuestions,
    correctAnswer: Strings.correctAnswer,
    incorrectAnswer: Strings.incorrectAnswer,
    buttonAnswer: Strings.buttonAnswer,
    questions,
  });
});

/**
 * Displays the form for creating a new question.
 */
router.get('/form', async (req, res) => {
  const categories = await questionRepository.getCategories();

  res.render('form', {
    title: Strings.newQuestionString,
    newQuestionString: Strings.newQuestionString,
    categoryString: Strings.categoryString,
    newCategoryString: Strings.newCategoryString,
    newAnswerString: Strings.newAnswerString,
    isAnswerCorrect: Strings.isAnswerCorrect,
    submitQuestion: Strings.submitQuestion,
    categories,
    errors: [],
  });
});

/**
 * Handles form submissions.
 */
router.post('/form', async (req, res) => {
  const sanitizedQuestion = xss(req.body.question);
  const sanitizedCategory = xss(req.body.category);
  const sanitizedNewCategory = xss(req.body.newCategory);
  const sanitizedCorrectAnswer = xss(req.body.correctAnswer);
  const errors = [];

  // Check Question
  if (
    !sanitizedQuestion ||
    sanitizedQuestion.trim() === '' ||
    sanitizedQuestion.length < config.questionMinLength ||
    sanitizedQuestion.length > config.questionMaxLength
  ) {
    errors.push({ msg: Strings.questionRequired });
  }

  // Check Category
  if (sanitizedCategory === 'new') {
    if (
      !sanitizedNewCategory ||
      sanitizedNewCategory.trim() === '' ||
      sanitizedNewCategory.length < config.categoryMinLength ||
      sanitizedNewCategory.length > config.categoryMaxLength
    ) {
      errors.push({ msg: Strings.categoryRequired });
    }
  } else if (isNaN(Number(sanitizedCategory))) {
    errors.push({ msg: Strings.categoryInvalid });
  }

  // Check Answers
  const answers = [];
  for (let i = 1; i <= 8; i++) {
    const answerText = xss(req.body[`ans${i}`]);
    if (
      answerText &&
      answerText.trim() !== '' &&
      answerText.length >= config.answerMinLength &&
      answerText.length <= config.answerMaxLength
    ) {
      answers.push({
        answer: answerText.trim(),
        isCorrect: sanitizedCorrectAnswer === String(i),
      });
    }
  }
  if (answers.length < 2) {
    errors.push({ msg: Strings.answerRequired });
  }
  if (!answers.some(ans => ans.isCorrect)) {
    errors.push({ msg: Strings.answerCorrectRequired });
  }

  // If there are errors, render the form again with the errors
  if (errors.length) {
    return res.status(400).render('form', {
      title: Strings.newQuestionString,
      newQuestionString: Strings.newQuestionString,
      categoryString: Strings.categoryString,
      newCategoryString: Strings.newCategoryString,
      newAnswerString: Strings.newAnswerString,
      isAnswerCorrect: Strings.isAnswerCorrect,
      submitQuestion: Strings.submitQuestion,
      errors,
      data: req.body,
      categories: await questionRepository.getCategories(),
    });
  }

  // Else, save the question
  const questionToSave: Question = {
    question: sanitizedQuestion,
    category:
      sanitizedCategory === 'new'
        ? { name: sanitizedNewCategory }
        : { id: Number(sanitizedCategory) },
    answers,
  };

  const result = await questionRepository.saveQuestion(questionToSave);

  console.log(result);

  res.render('form-created', { title: 'Spurning búinn til' });
});

router.use((req, res) => {
  res.status(404).render('not-found', {
    title: Strings.notFound,
    notFound: Strings.notFound,
  });
});

/**
 * Handles errors.
 */
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err.status === 404) {
    return res.status(404).render('not-found', {
      title: Strings.notFound,
      notFound: Strings.categoryNotFound,
    });
  }
  // For all other errors, render a generic error page or pass along.
  res.status(err.status || 500).render('error', {
    title: Strings.internalError,
  });
};

router.use(errorHandler);
