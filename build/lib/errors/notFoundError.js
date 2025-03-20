/**
 * @file notFoundError.ts
 * @description Error class for 404 Not Found errors.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date February 19, 2025
 */
/**
 * Error class for 404 Not Found errors.
 */
export class NotFoundError extends Error {
    /**
     * Creates an instance of NotFoundError.
     * @param message - The error message.
     */
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.status = 404;
    }
}
