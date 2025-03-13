/**
 * @file index.ts
 * @description Initializes the server and sets up the routes for the application.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies hono, @hono/node-server, logger.ts, categories.ts, questions.ts
 */
import { categoriesApp } from './routes/categories.js';
import { questionsApp } from './routes/questions.js';
import { logger } from './lib/io/logger.js';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
const DEFAULT_PORT = 3000;
const port = process.env.PORT
    ? parseInt(process.env.PORT)
    : DEFAULT_PORT;
const app = new Hono()
    .route('/categories', categoriesApp)
    .route('/questions', questionsApp);
app.get('/', c => {
    return c.text('Hello Hono!');
});
serve({
    fetch: app.fetch,
    port: port,
}, info => {
    logger.info(`Server is running on port: ${info.port}`);
});
