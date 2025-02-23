/**
 * @file question.ts
 * @description Types for questions and categories.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date February 18, 2025
 */

export interface Question {
  id?: number;
  question: string;
  category: Category;
  answers: Answer[];
}

export interface Answer {
  id?: number;
  answer: string;
  isCorrect: boolean;
}

export interface Category {
  id?: number;
  name?: string;
}
