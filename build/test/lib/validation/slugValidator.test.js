/**
 * @file slugValidator.test.ts
 * @description Tests for the slugValidator.ts file.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 6, 2025
 * @dependencies slugValidator.ts, vitest
 */
import { validateAndSanitizeSlug } from '../../../lib/validation/slugValidator.js';
import { describe, it, expect } from 'vitest';
describe('validateAndSanitizeSlug', () => {
    it('Should validate and sanitize a valid slug', async () => {
        const input = 'test-slug';
        const result = await validateAndSanitizeSlug(input);
        expect(result).toHaveProperty('data');
        expect(result.data).toBe('test-slug');
        expect(result.error).toBeUndefined();
    });
    it('Should return an error for an invalid slug', async () => {
        const input = '';
        const result = await validateAndSanitizeSlug(input);
        expect(result).toHaveProperty('error');
        expect(result.error).toBeDefined();
        expect(result.data).toBeUndefined();
    });
});
