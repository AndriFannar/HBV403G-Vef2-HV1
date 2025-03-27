/**
 * @file sanitizeString.ts
 * @description Sanitizes a string field.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 22, 2025
 * @dependencies xss
 */

import xss from 'xss';

/**
 * Sanitizes a string field.
 * @param field - The string to sanitize.
 * @returns - The sanitized string.
 */
export const sanitizeString = (field: string): string => xss(field.trim());
