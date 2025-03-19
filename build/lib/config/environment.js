/**
 * @file environment.ts
 * @description Environment configuration module. Validates and returns the environment variables. Made from https://github.com/vefforritun/vef2-2025-v2-synilausn/blob/main/src/lib/environment.js
 * @author Ólafur Sverrir Kjartansson
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date February 25, 2025
 */
const DEFAULT_PORT = 3000;
let parsedEnvironment = null;
/**
 * Validates and returns the environment variables. If validation fails, it will return `mull`.
 * @param env {NodeJS.ProcessEnv} - Environment variables.
 * @param logger {import('../io/logger.js').Logger} - Logger instance.
 * @returns {Environment | null} - Environment variables or null if validation fails.
 */
export function getEnvironment(env, logger) {
    if (parsedEnvironment) {
        return parsedEnvironment;
    }
    const { PORT: port, DATABASE_URL: databaseUrl, JWT_SECRET: jwt_secret } = env;
    let error = false;
    if (!databaseUrl || databaseUrl.length === 0) {
        logger.error('DATABASE_URL must be defined as a string');
        error = true;
    }
    let usedPort = DEFAULT_PORT;
    const parsedPort = parseInt(port ?? '', 10);
    if (!port || isNaN(parsedPort)) {
        logger.error('PORT must be defined as a number');
        error = true;
    }
    else if (parsedPort) {
        usedPort = parsedPort;
    }
    else {
        logger.info(`PORT not defined, using default port ${DEFAULT_PORT}`);
    }
    if (!jwt_secret || jwt_secret.length === 0) {
        if (error) {
            return null;
        }
        parsedEnvironment = {
            port: usedPort,
            databaseUrl: databaseUrl,
        };
        return parsedEnvironment;
    }
}
