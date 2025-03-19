/**
 * @file validator.test.ts
 * @description Tests for the validator.ts file.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 6, 2025
 * @dependencies validator.ts, vitest, zod
 */
import { Validator } from '../../entities/validator.js';
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
const sampleSchema = z.object({
    foo: z.string(),
});
const wrappedValidator = Validator(sampleSchema);
describe('Validator', () => {
    it('Should validate correct data in the "data" property', () => {
        const validInput = { data: { foo: 'bar' } };
        const result = wrappedValidator.safeParse(validInput);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.data).toEqual({ foo: 'bar' });
            expect(result.data.error).toBeUndefined();
        }
    });
    it('Should fail validation if "data" does not conform to the schema', () => {
        const invalidInput = { data: { foo: 123 } };
        const result = wrappedValidator.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].path).toContain('data');
        }
    });
    it('Should validate when only the "error" property is provided', () => {
        const inputWithError = { error: { message: 'Something went wrong' } };
        const result = wrappedValidator.safeParse(inputWithError);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.error).toEqual({ message: 'Something went wrong' });
            expect(result.data.data).toBeUndefined();
        }
    });
    it('Should validate when both "data" and "error" properties are provided', () => {
        const input = { data: { foo: 'bar' }, error: { message: 'Warning' } };
        const result = wrappedValidator.safeParse(input);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.data).toEqual({ foo: 'bar' });
            expect(result.data.error).toEqual({ message: 'Warning' });
        }
    });
});
