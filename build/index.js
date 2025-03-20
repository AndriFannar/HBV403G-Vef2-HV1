/**
 * @file index.ts
 * @description Initializes the server and sets up the routes for the application.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 04, 2025
 * @dependencies hono, @hono/node-server, logger.ts, categories.ts, questions.ts
 */
import { getEnvironment } from './lib/config/environment.js';
import { categoriesApp } from './routes/categories.js';
import { questionsApp } from './routes/questions.js';
import { StatusCodes } from 'http-status-codes';
import { usersApp } from './routes/users.js';
import { logger } from './lib/io/logger.js';
import { serve } from '@hono/node-server';
import { verify } from 'hono/jwt';
import { Hono } from 'hono';
const env = getEnvironment(process.env, logger);
if (!env) {
    process.exit(1);
}
const app = new Hono()
    .route('/categories', categoriesApp)
    .route('/questions', questionsApp)
    .route('/users', usersApp);
export const adminMiddleware = async (c, next) => {
    const payload = await c.get('jwtPayload');
    const decodedPayload = await verify(payload, env.jwtSecret);
    if (decodedPayload && decodedPayload.role === 'admin') {
        await next();
    }
    else {
        return c.json({ message: 'Unauthorized' }, StatusCodes.UNAUTHORIZED);
    }
};
app.get('/', c => {
    return c.text('Hello Hono!');
});
serve({
    fetch: app.fetch,
    port: env.port,
}, info => {
    logger.info(`Server is running on port: ${info.port}`);
});
