/**
 * @file jsonSchema.ts
 * @description Defines a JSON schema for questions.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date February 19, 2025
 */

export interface JsonSchema {
  name?: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  items?: JsonSchema;
  properties?: { [key: string]: JsonSchema };
}

export interface QuestionSchema {
  title: string;
  questions: {
    question: string;
    answers: {
      answer: string;
      correct: boolean;
    }[];
  }[];
}

export const questionSchema: JsonSchema = {
  name: 'questionSchema',
  type: 'object',
  required: true,
  properties: {
    title: { type: 'string', required: true },
    questions: {
      type: 'array',
      required: true,
      items: {
        type: 'object',
        required: true,
        properties: {
          question: { type: 'string', required: true },
          answers: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              required: true,
              properties: {
                answer: { type: 'string', required: true },
                correct: { type: 'boolean', required: true },
              },
            },
          },
        },
      },
    },
  },
};
