/**
 * @file index.ts
 * @description Initializes the server and sets up the routes for the application.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies hono, businessRules.routes.js, conditions.routes.js, projects.routes.js, useCases.routes.js, actors.routes.js, admin.routes.js, flows.routes.js, users.routes.js, logger.js, environment.js
 */

import { businessRuleApp } from './routes/businessRules.routes.js';
import { getEnvironment } from './lib/config/environment.js';
import { conditionApp } from './routes/conditions.routes.js';
import { projectApp } from './routes/projects.routes.js';
import { useCaseApp } from './routes/useCases.routes.js';
import { actorApp } from './routes/actors.routes.js';
import { adminApp } from './routes/admin.routes.js';
import { flowApp } from './routes/flows.routes.js';
import { userApp } from './routes/users.routes.js';
import { logger } from './lib/io/logger.js';
import { serve } from '@hono/node-server';
import { showRoutes } from 'hono/dev';
import { Hono } from 'hono';

const env = getEnvironment(process.env, logger);

if (!env) {
  process.exit(1);
}

const app = new Hono()
  .route('/users', userApp)
  .route('/admin', adminApp)
  .route('/projects', projectApp)
  .route('/projects/:projectId/actors', actorApp)
  .route('/projects/:projectId/useCases', useCaseApp)
  .route('/projects/:projectId/businessRules', businessRuleApp)
  .route('/projects/:projectId/useCases/:useCaseId/flows', flowApp)
  .route('/projects/:projectId/useCases/:useCaseId/conditions', conditionApp);

app.get('/', c => {
  const routes = [
    { method: 'GET', path: '/admin/actors' },
    { method: 'GET', path: '/projects/:projectId/actors' },
    { method: 'GET', path: '/projects/:projectId/actors/:id' },
  ];
  return c.json(routes);
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
