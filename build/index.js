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
import { projectApp } from './routes/projects.routes.js';
import { useCaseApp } from './routes/useCases.routes.js';
import { actorApp } from './routes/actors.routes.js';
import { adminApp } from './routes/admin.routes.js';
import { userApp } from './routes/users.routes.js';
import { logger } from './lib/io/logger.js';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
const env = getEnvironment(process.env, logger);
if (!env) {
    process.exit(1);
}
export const app = new Hono()
    .route('/users', userApp)
    .route('/admin', adminApp)
    .route('/users/:userId/projects', projectApp)
    .route('/users/:userId/projects/:projectId/actors', actorApp)
    .route('/users/:userId/projects/:projectId/useCases', useCaseApp)
    .route('/users/:userId/projects/:projectId/businessRules', businessRuleApp);
app.get('/', c => {
    const routes = [
        { method: 'POST', path: '/users/login' },
        { method: 'POST', path: '/users/signup' },
        { method: 'GET', path: '/admin/users' },
        { method: 'GET', path: '/admin/projects' },
        { method: 'GET', path: '/admin/actors' },
        { method: 'GET', path: '/admin/businessRules' },
        { method: 'GET', path: '/admin/useCases' },
        { method: 'GET', path: '/users/:userId/projects/summary' },
        { method: 'GET', path: '/users/:userId/projects/:projectId' },
        { method: 'POST', path: '/users/:userId/projects/' },
        { method: 'PATCH', path: '/users/:userId/projects/:projectId' },
        { method: 'DELETE', path: '/users/:userId/projects/:projectId' },
        { method: 'GET', path: '/users/:userId/projects/:projectId/actors' },
        {
            method: 'GET',
            path: '/users/:userId/projects/:projectId/actors/:actorId',
        },
        { method: 'POST', path: '/users/:userId/projects/:projectId/actors' },
        {
            method: 'PATCH',
            path: '/users/:userId/projects/:projectId/actors/:actorId',
        },
        {
            method: 'DELETE',
            path: '/users/:userId/projects/:projectId/actors/:actorId',
        },
        { method: 'GET', path: '/users/:userId/projects/:projectId/businessRules' },
        {
            method: 'GET',
            path: '/users/:userId/projects/:projectId/businessRules/:businessRuleId',
        },
        {
            method: 'POST',
            path: '/users/:userId/projects/:projectId/businessRules',
        },
        {
            method: 'PATCH',
            path: '/users/:userId/projects/:projectId/businessRules/:businessRuleId',
        },
        {
            method: 'DELETE',
            path: '/users/:userId/projects/:projectId/businessRules/:businessRuleId',
        },
        { method: 'GET', path: '/users/:userId/useCases/summary' },
        {
            method: 'GET',
            path: '/users/:userId/projects/:projectId/useCases/summary',
        },
        {
            method: 'GET',
            path: '/users/:userId/projects/:projectId/useCases/:useCaseId',
        },
        {
            method: 'POST',
            path: '/users/:userId/projects/:projectId/useCases',
        },
        {
            method: 'PATCH',
            path: '/users/:userId/projects/:projectId/useCases/:useCaseId',
        },
        {
            method: 'DELETE',
            path: '/users/:userId/projects/:projectId/useCases/:useCaseId',
        },
    ];
    return c.json(routes);
});
app.all('*', c => c.json({ message: 'Endpoint not found' }, StatusCodes.NOT_FOUND));
if (process.env.NODE_ENV !== 'test') {
    serve({
        fetch: app.fetch,
        port: env.port,
    }, info => {
        logger.info(`Server is running on port: ${info.port}`);
    });
}
