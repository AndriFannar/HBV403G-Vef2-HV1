/**
 * @file server.ts
 * @description Initializes the server and sets up the routes for the application. Uses a router and sets up the database.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date February 18, 2025
 * @dependencies express, dotenv, initDatabase, fileURLToPath, router
 */
import { initDatabase } from './lib/repositories/initDatabase.js';
import express, { urlencoded } from 'express';
import { router } from './routes.js';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const templatePath = process.env.TEMPLATE_PATH
    ? fileURLToPath(new URL(process.env.TEMPLATE_PATH, import.meta.url))
    : fileURLToPath(new URL('./res/templates', import.meta.url));
const app = express();
// Set up the application
app.use(express.static('public'));
app.use(urlencoded({ extended: true }));
app.set('view engine', 'ejs');
console.log(templatePath);
app.set('views', templatePath);
// Log incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});
// Use a router
app.use('/', router);
// Init database and start server
initDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Server running at port: ${port}/`);
    });
});
