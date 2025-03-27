/**
 * @file index.ts
 * @description Initializes the server and sets up the routes for the application.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies hono, @hono/node-server, logger.ts, categories.ts, questions.ts
 */

import { getEnvironment } from './lib/config/environment.js';
import { usersApp } from './routes/userRoutes.js';
import { logger } from './lib/io/logger.js';
import { serve } from '@hono/node-server';
import { showRoutes } from 'hono/dev';
import { Hono } from 'hono';

const env = getEnvironment(process.env, logger);

if (!env) {
  process.exit(1);
}

const app = new Hono()
  .route('/actors', actorApp)
  .route('/businessRules', businessRuleApp)
  .route('/conditions', conditionApp)
  .route('/flows', flowApp)
  .route('/projects', projectApp)
  .route('/useCases', useCaseApp)
  .route('/users', usersApp);

app.get('/', c => {
  return c.text('Hello Hono!');
});

serve(
  {
    fetch: app.fetch,
    port: env.port,
  },
  info => {
    logger.info(`Server is running on port: ${info.port}`);
  }
);

showRoutes(app, {
  verbose: true,
});
