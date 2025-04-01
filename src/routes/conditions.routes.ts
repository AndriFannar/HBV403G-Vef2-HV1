/**
 * @file conditions.routes.ts
 * @description Contains the routes for the condition endpoint of the API.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies
 */

import type { Variables } from '../entities/context.js';
import { Hono } from 'hono';

export const conditionApp = new Hono<{ Variables: Variables }>();
