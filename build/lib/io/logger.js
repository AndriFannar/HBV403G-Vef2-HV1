/**
 * @file logger.ts
 * @description Logger class which logs messages to the console. Made from https://github.com/vefforritun/vef2-2025-v2-synilausn/blob/main/src/lib/logger.js
 * @author Ólafur Sverrir Kjartansson
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date February 25, 2025
 */
/* eslint-disable no-console */
/**
 * Logger class which logs messages to the console.
 */
export class Logger {
    silent;
    /**
     * Creates a new Logger.
     * @param silent - Whether the logger should be silent or not.
     */
    constructor(silent = false) {
        this.silent = silent;
    }
    /**
     * Logs messages to the console.
     * @param messages - Messages to log.
     */
    info(...messages) {
        if (!this.silent) {
            console.info(...messages);
        }
    }
    /**
     * Logs warning messages to the console.
     * @param messages - Messages to log.
     */
    warn(...messages) {
        if (!this.silent) {
            console.warn(...messages);
        }
    }
    /**
     * Logs error messages to the console.
     * @param messages - Messages to log.
     */
    error(...messages) {
        if (!this.silent) {
            console.error(...messages);
        }
    }
}
/**
 * The default logger.
 */
export const logger = new Logger();
